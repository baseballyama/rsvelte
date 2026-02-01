//#region src-js/libs/prettier.ts
let prettierCache;
/**
* TODO: Plugins support
* - Read `plugins` field
* - Load plugins dynamically and parse `languages` field
* - Map file extensions and filenames to Prettier parsers
*
* @returns Array of loaded plugin's `languages` info
*/
async function resolvePlugins() {
	return [];
}
const TAG_TO_PARSER = {
	css: "css",
	styled: "css",
	gql: "graphql",
	graphql: "graphql",
	html: "html",
	md: "markdown",
	markdown: "markdown"
};
/**
* Format xxx-in-js code snippets
*
* @returns Formatted code snippet
* TODO: In the future, this should return `Doc` instead of string,
* otherwise, we cannot calculate `printWidth` correctly.
*/
async function formatEmbeddedCode({ code, tagName, options }) {
	const parserName = TAG_TO_PARSER[tagName];
	if (!parserName) return code;
	if (!prettierCache) prettierCache = await import("./prettier-CZNG3Ahs.js");
	options.parser = parserName;
	return prettierCache.format(code, options).then((formatted) => formatted.trimEnd()).catch(() => code);
}
/**
* Format non-js file
*
* @returns Formatted code
*/
async function formatFile({ code, parserName, fileName, options }) {
	if (!prettierCache) prettierCache = await import("./prettier-CZNG3Ahs.js");
	options.parser = parserName;
	options.filepath = fileName;
	await setupTailwindPlugin(options);
	return prettierCache.format(code, options);
}
let tailwindPlugin = null;
const TAILWIND_OPTION_MAPPING = {
	config: "tailwindConfig",
	stylesheet: "tailwindStylesheet",
	functions: "tailwindFunctions",
	attributes: "tailwindAttributes",
	preserveWhitespace: "tailwindPreserveWhitespace",
	preserveDuplicates: "tailwindPreserveDuplicates"
};
/**
* Load prettier-plugin-tailwindcss lazily.
* @returns The plugin module or null if not available.
*/
async function loadTailwindPlugin() {
	if (tailwindPlugin) return tailwindPlugin;
	try {
		tailwindPlugin = await import("./dist-BwrMNepk.js");
		return tailwindPlugin;
	} catch {
		return null;
	}
}
/**
* Map Oxfmt Tailwind options to Prettier format.
*/
function mapTailwindOptions(tailwindcss, target) {
	for (const [oxfmtKey, prettierKey] of Object.entries(TAILWIND_OPTION_MAPPING)) {
		const value = tailwindcss[oxfmtKey];
		if (value !== void 0) target[prettierKey] = value;
	}
}
/**
* Set up Tailwind CSS plugin for Prettier when experimentalTailwindcss is enabled.
* Loads the plugin lazily and maps Oxfmt config options to Prettier format.
*/
async function setupTailwindPlugin(options) {
	const tailwindcss = options.experimentalTailwindcss;
	if (!tailwindcss) return;
	const plugin = await loadTailwindPlugin();
	if (plugin) {
		options.plugins = options.plugins || [];
		options.plugins.push(plugin);
		mapTailwindOptions(tailwindcss, options);
	}
	delete options.experimentalTailwindcss;
}
/**
* Process Tailwind CSS classes found in JSX attributes.
* @param args - Object containing filepath, classes, and options
* @returns Array of sorted class strings (same order/length as input)
*/
async function sortTailwindClasses({ filepath, classes, options = {} }) {
	const plugin = await loadTailwindPlugin();
	if (!plugin) return classes;
	const tailwindcss = options.experimentalTailwindcss || {};
	const configOptions = {
		filepath,
		...options
	};
	mapTailwindOptions(tailwindcss, configOptions);
	const tailwindContext = await plugin.getTailwindConfig(configOptions);
	if (!tailwindContext) return classes;
	const env = {
		context: tailwindContext,
		options: configOptions
	};
	return classes.map((classStr) => {
		try {
			return plugin.sortClasses(classStr, { env });
		} catch {
			return classStr;
		}
	});
}

//#endregion
export { sortTailwindClasses as a, resolvePlugins as i, formatEmbeddedCode as n, formatFile as r, TAILWIND_OPTION_MAPPING as t };