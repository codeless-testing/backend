import 'dotenv/config';

const {PORT, MONGO_URI, ACCESS_KEY_ID, SECRET_ACCESS_KEY} = process.env;

export const environments = {PORT, MONGO_URI, ACCESS_KEY_ID, SECRET_ACCESS_KEY}
