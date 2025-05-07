import {environments} from "./environments/environments";

// @ts-ignore
import express from 'express';
import {indexRouter} from "./routes";

const app = express();


const port = environments.PORT;

app.use('/', indexRouter);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

