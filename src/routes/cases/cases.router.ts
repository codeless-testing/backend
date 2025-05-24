import express = require("express");
import {casesSchema} from "./models/cases.model";
import {runTestCases} from "./functions/run-test-cases";

export const casesRouter = express.Router();

casesRouter.get('/list', async function (req, res, next) {
    const cases: any[] = await casesSchema.find();
    const response = cases.map(({_id, createdAt, updatedAt, name}) => ({id: _id, updatedAt, createdAt, name}))
    return res.status(200).json(response);
});

casesRouter.get('/:id', async (req, res, next) => {
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

casesRouter.get('/run-tests/:id', async (req, res) => {
    const { id } = req.params;
    const headed = true;
    const filter = id ? { _id: id } : {};
    const testDocs = await casesSchema.find(filter);

    if (!testDocs.length) return res.status(404).json({ error: 'No test docs found' });

    const results = [];
    for (const doc of testDocs) {
        const r = await runTestCases(doc, headed);
        results.push(r);
    }
    res.json({ total: results.length, results });
});
