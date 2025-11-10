import "dotenv/config";

export const env = {
	databaseUrl: process.env.DATABASE_URL,
	port: parseInt(process.env.PORT || "8080", 10),
	ssl: process.env.PGSSL === "true"
};
