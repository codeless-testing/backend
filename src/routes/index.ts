// @ts-ignore
import express from "express";

export const indexRouter = express.Router();

/* GET home page. */
indexRouter.get('/', function(req, res, next) {
  res.send('hello world!');
});
