import express = require("express");
import {indexRouter} from "./routes";
import {environments} from "./environments/environments";
import * as mongoose from "mongoose";
import {casesRouter} from "./routes/cases/cases.router";

const app = express();

const {PORT, MONGO_URI} = environments;


mongoose.connect(MONGO_URI).then(() => {
      console.log('Connected to MongoDB');
    })
    .catch((error) => {
      console.error('Error connecting to MongoDB:', error);
    });
app.use(express.json());

app.use('/', indexRouter);
app.use('/cases', casesRouter);


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})

