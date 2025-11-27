import * as path from 'path'
import * as dotenv from 'dotenv';

// I am calling this code snippet here, as I faced an issue with environment variables
// not being loaded correctly. For modules that were previously called before this code snippet.
// modules dealing with DB etc.
const envPath = path.resolve(__dirname, '../.env')
dotenv.config({
  path: envPath
});
