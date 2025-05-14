import express from "express";
import multer  from "multer";

import {
    AmplifyClient,
    CreateDeploymentCommand,
    StartDeploymentCommand,
} from "@aws-sdk/client-amplify";
import {waitForJobDone} from "./wait-function";

export const deployRouter = express.Router();

/*─── 1. BASIC WIRING ───────────────────────────────────────────────────────*/
const upload  = multer({ storage: multer.memoryStorage() });   // keep file in RAM
const region  = process.env.AWS_REGION as string;
const amplify = new AmplifyClient({ region });

/*─── 2. THE ENDPOINT ───────────────────────────────────────────────────────*/
deployRouter.post(
    "/upload-zip",
    upload.single("artifact"),
    async (req, res, next) => {
        if (!req.file)
            return res.status(400).json({ error: "file field missing" });

        try {
            /* 3-a. Create one-time upload URL */
            const { jobId, zipUploadUrl } = await amplify.send(
                new CreateDeploymentCommand({
                    appId:      process.env.AMPLIFY_APP_ID!,
                    branchName: process.env.AMPLIFY_BRANCH!,
                })
            );

            /* 3-b. PUT the ZIP to that URL */
            await fetch(zipUploadUrl!, {
                method:  "PUT",
                body:    req.file.buffer,
                headers: { "content-type": "application/zip" },
            });

            /* 3-c. Start the deployment */
            await amplify.send(
                new StartDeploymentCommand({
                    appId:      process.env.AMPLIFY_APP_ID!,
                    branchName: process.env.AMPLIFY_BRANCH!,
                    jobId,
                })
            );

            /* 3-d. ⏳ Wait until Amplify finishes building */
            const finalSummary = await waitForJobDone(
                amplify,
                process.env.AMPLIFY_APP_ID!,
                process.env.AMPLIFY_BRANCH!,
                jobId
            );                                         // GetJob API used above :contentReference[oaicite:1]{index=1}

            res.json({
                message:  "Deployment finished",
                jobId,
                finalStatus:  finalSummary.status,       // SUCCEED / FAILED / CANCELLED
                started:      new Date(finalSummary.startTime!).toISOString(),
                ended:        new Date(finalSummary.endTime!).toISOString(),
            });
        } catch (err) {
            next(err);
        }
    }
);
