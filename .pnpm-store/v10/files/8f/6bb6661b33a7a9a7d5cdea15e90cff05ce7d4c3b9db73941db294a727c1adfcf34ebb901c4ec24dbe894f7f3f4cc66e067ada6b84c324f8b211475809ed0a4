import { t as format$1 } from "./bindings-D1pGt4ma.js";
import { a as sortTailwindClasses, i as resolvePlugins, n as formatEmbeddedCode, r as formatFile } from "./prettier-BzdOJjeO.js";

//#region src-js/index.ts
/**
* Format the given source text according to the specified options.
*/
async function format(fileName, sourceText, options) {
	if (typeof fileName !== "string") throw new TypeError("`fileName` must be a string");
	if (typeof sourceText !== "string") throw new TypeError("`sourceText` must be a string");
	return format$1(fileName, sourceText, options ?? {}, resolvePlugins, (options$1, tagName, code) => formatEmbeddedCode({
		options: options$1,
		tagName,
		code
	}), (options$1, parserName, fileName$1, code) => formatFile({
		options: options$1,
		parserName,
		fileName: fileName$1,
		code
	}), (filepath, options$1, classes) => sortTailwindClasses({
		filepath,
		classes,
		options: options$1
	}));
}

//#endregion
export { format };