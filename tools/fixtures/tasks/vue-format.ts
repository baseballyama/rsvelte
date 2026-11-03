import * as prettier from 'prettier';
import type { Task } from '../types.ts';

// Written out so the snapshot does not depend on a prettier default changing. prettier formats
// `.vue` itself; no plugin.
export const FORMAT_OPTIONS = {
	parser: 'vue',
	printWidth: 80,
	tabWidth: 2,
	useTabs: false,
	semi: true,
	singleQuote: false,
	trailingComma: 'all',
	bracketSpacing: true,
	vueIndentScriptAndStyle: false
} as const;

const task: Task = {
	id: 'vue.format',
	storage: 'committed',
	oracles: ['prettier'],
	variants: [{ id: 'default', options: {} }],
	appliesTo: (unit) => unit.lang === 'vue' && unit.source === 'rsvelte',
	async run(unit, src) {
		const text = await prettier.format(src, { ...FORMAT_OPTIONS, filepath: unit.path });
		return { vue: { text, ext: 'vue', compare: 'text' } };
	}
};
export default task;
