import * as path from 'node:path';
import * as fs from 'node:fs';

process.env.NODE_ENV = 'test';

const envTestPath = path.join(process.cwd(), '.env.test');
if (fs.existsSync(envTestPath)) {
	require('dotenv').config({ path: envTestPath });
}

if (process.env.TEST_DATABASE_URL) {
	process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
}
