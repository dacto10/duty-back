export default async () => {
	if (!process.env.TEST_DATABASE_URL) {
		throw new Error('TEST_DATABASE_URL not set. Create .env.test with TEST_DATABASE_URL=');
	}
};
