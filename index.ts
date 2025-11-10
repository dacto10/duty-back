import bootstrap from "./src/app";
import { env } from "./src/utils";

if (env.node_env === "test") {
	const PORT = env.port || 3000;

	bootstrap.listen(PORT, () => {
		console.log(`Server is running on port ${PORT}`);
	});
}
