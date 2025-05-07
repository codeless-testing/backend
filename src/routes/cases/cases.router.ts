import express = require("express");
import {casesSchema} from "./models/cases.model";

export const casesRouter = express.Router();

casesRouter.get('/list', async function (req, res, next) {
    const cases: any[] = await casesSchema.find();
    const response = cases.map(({_id, createdAt, updatedAt, name}) => ({id: _id, updatedAt, createdAt, name}))
    return res.status(200).json(response);
});

casesRouter.get('/:id', async function (req, res, next) {
    const { id } = req.params;
    const cases = await casesSchema.findById(id);
    return res.status(200).json(cases);
});

casesRouter.post('/create', async function (req, res, next) {
    const { body } = req;
    const newCase = new casesSchema({...body})
    await newCase.save();
    res.status(200).json(newCase);
});
