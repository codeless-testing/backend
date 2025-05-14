import express = require("express");
const multer = require('multer');
const unzipper = require('unzipper');
import {S3Client, PutObjectCommand} from "@aws-sdk/client-s3";
import {environments} from "../../environments/environments";

const {ACCESS_KEY_ID, SECRET_ACCESS_KEY} = environments;

export const deployRouter  = express.Router();

/*─── 1.  BASIC WIRING ───────────────────────────────────────────────────────*/
const upload = multer({ storage: multer.memoryStorage() });   // <- keeps file in RAM
const s3     = new S3Client({ region: process.env.AWS_REGION });

/*─── 2.  THE ENDPOINT ───────────────────────────────────────────────────────*/
//@ts-ignore
deployRouter.post('/upload-zip', upload.single('artifact'), async (req, res, next) => {
    //@ts-ignore
    if (!req.file) return res.status(400).json({ error: 'file field missing' });
    //@ts-ignore
    const zipKey = req.file.originalname;

    try {
        /* 2-a Upload the raw ZIP (handy for auditing / re-processing later) */
        await s3.send(new PutObjectCommand({
            Bucket: process.env.BUCKET_NAME,
            Key:    zipKey,
            //@ts-ignore
            Body:   req.file.buffer,
            ContentType: 'application/zip',
        }));

        /* 2-b Extract & upload every entry in parallel (throttled by Promise.all) */
        const directory = await unzipper.Open.buffer(req.file.buffer);

        console.log(directory.files)

        await Promise.all(
            directory.files.map(async file => {
                if (file.type !== 'File') return;

                const parts = file.path.split('/');

                const trimmedPath = parts.length > 1 ? parts.slice(1).join('/') : file.path;
                if (!trimmedPath) return;                    // safety: ignore top-level dir entry

                const body      = await file.buffer();                   // <Buffer …>

                await s3.send(new PutObjectCommand({
                    Bucket: process.env.BUCKET_NAME,
                    Key:    trimmedPath,
                    Body:   body,
                }));
            })
        );

        res.json({
            message:    'ZIP stored and extracted to S3',
            zipObject:  zipKey,
            filesCount: directory.files.length,
        });
    } catch (err) {
        next(err);                   // let your global error middleware handle it
    }
});
