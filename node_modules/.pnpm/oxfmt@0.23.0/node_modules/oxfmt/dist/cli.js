import { n as runCli } from "./bindings-D1pGt4ma.js";
import { i as resolvePlugins } from "./prettier-BzdOJjeO.js";
import Tinypool from "tinypool";

//#region src-js/cli/worker-proxy.ts
let pool = null;
async function initExternalFormatter(numThreads) {
	pool = new Tinypool({
		filename: new URL("./cli-worker.js", import.meta.url).href,
		minThreads: numThreads,
		maxThreads: numThreads
	});
	return resolvePlugins();
}
async function formatEmbeddedCode(options, tagName, code) {
	return pool.run({
		options,
		code,
		tagName
	}, { name: "formatEmbeddedCode" });
}
async function formatFile(options, parserName, fileName, code) {
	return pool.run({
		options,
		code,
		fileName,
		parserName
	}, { name: "formatFile" });
}
async function sortTailwindClasses(filepath, options, classes) {
	return pool.run({
		filepath,
		options,
		classes
	}, { name: "sortTailwindClasses" });
}

//#endregion
//#region src-js/cli.ts
(async () => {
	const [mode, exitCode] = await runCli(process.argv.slice(2), initExternalFormatter, formatEmbeddedCode, formatFile, sortTailwindClasses);
	if (mode === "init") {
		await import("./init-BQYL9OnU.js").then((m) => m.runInit());
		return;
	}
	if (mode === "migrate:prettier") {
		await import("./migrate-prettier-CcpDyeNG.js").then((m) => m.runMigratePrettier());
		return;
	}
	process.exitCode = exitCode;
})();

//#endregion
export {  };