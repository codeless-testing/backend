import 'dotenv/config';

const {PORT, MONGO_URI} = process.env;

export const environments = {PORT, MONGO_URI}
