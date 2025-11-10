import { App } from "./src/app";
import { env } from "./src/utils";

const app = new App();

app.init().listen(env.port, () => {
	console.log(`Server running on port ${env.port}`);
});
