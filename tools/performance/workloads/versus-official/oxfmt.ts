// `oxfmt.ts`: oxfmt's `format` as a fourth format arm, with Prettier's options that the corpus
// oracle writes out (`tools/oracle/tasks/svelte-format.ts`). oxfmt formats a `.svelte` file with
// the prettier-plugin-svelte it bundles, and needs `svelte` next to it. `OXFMT_DIRECTORY` names a
// directory whose `node_modules` holds both; the workflow installs the latest oxfmt there.
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { arm } from './node-arm.ts';

const OPTIONS = {
	printWidth: 80,
	tabWidth: 2,
	useTabs: false,
	semi: true,
	singleQuote: false,
	trailingComma: 'all',
	bracketSpacing: true,
	svelte: { sortOrder: 'options-scripts-markup-styles', indentScriptAndStyle: true },
} as const;

type Format = (
	fileName: string,
	sourceText: string,
	options: typeof OPTIONS,
) => Promise<{ code: string; errors: { message: string }[] }>;

await arm('oxfmt', import.meta.url, async (task) => {
	if (task !== 'format') throw new Error('oxfmt only formats');
	const directory = process.env.OXFMT_DIRECTORY;
	if (!directory) throw new Error('OXFMT_DIRECTORY is not set');
	const require = createRequire(path.join(path.resolve(directory), 'package.json'));
	const { format } = (await import(pathToFileURL(require.resolve('oxfmt')).href)) as {
		format: Format;
	};
	return async (filename, source) => {
		const { code, errors } = await format(filename, source, OPTIONS);
		if (errors.length > 0) throw new Error(errors[0]!.message);
		return { compared: [['svelte', code]], otherBytes: 0 };
	};
});
