// Which Rust files the site can quote, and the key each is quoted under. Shared by the build plugin
// and by the excerpt test, so a page and its test resolve a key against the same file.

import { readdirSync } from 'node:fs';
import path from 'node:path';

/** Role names used in item keys. */
export const CRATES: Record<string, string> = {
	rsvelte_kernel: 'kernel',
	rsvelte_svelte: 'svelte',
	rsvelte_javascript: 'javascript',
	rsvelte_command_line: 'command_line',
	rsvelte_vue: 'vue',
	rsvelte_svue: 'svue',
	rsvelte_vuelte: 'vuelte',
	rsvelte_markup: 'markup'
};

/** Every kernel module, plus the plugin code the guide uses as worked examples. */
export function sources(cratesDir: string): { key: string; file: string }[] {
	const kernel = readdirSync(path.join(cratesDir, 'rsvelte_kernel/src'), { recursive: true, encoding: 'utf8' })
		.filter((f) => f.endsWith('.rs'))
		.sort()
		.map((f) => ({ key: `kernel/${f.replaceAll(path.sep, '/').replace(/(?:\/mod)?\.rs$/, '')}`, file: `rsvelte_kernel/src/${f}` }));
	const examples = [
		'rsvelte_svelte/src/lib.rs',
		'rsvelte_svelte/examples/plugin.rs',
		'rsvelte_svelte/src/computation.rs',
		'rsvelte_svelte/src/syntax/syntax_tree.rs',
		'rsvelte_svelte/src/syntax/parse.rs',
		'rsvelte_svelte/src/computation/tasks.rs',
		'rsvelte_svelte/src/tooling/lint.rs',
		'rsvelte_svelte/src/semantic/resolve.rs',
		'rsvelte_svelte/src/compilation/compiler_syntax_tree.rs',
		'rsvelte_svelte/src/tooling/project.rs',
		'rsvelte_javascript/src/syntax_tree.rs',
		'rsvelte_javascript/src/lexer.rs',
		'rsvelte_javascript/src/parser.rs',
		'rsvelte_javascript/src/lint.rs',
		'rsvelte_javascript/src/check.rs',
		'rsvelte_vue/src/lib.rs',
		'rsvelte_vue/src/syntax_tree.rs',
		'rsvelte_vue/src/tasks.rs',
		'rsvelte_vue/src/lint.rs',
		'rsvelte_svue/src/lib.rs',
		'rsvelte_svue/src/template.rs',
		'rsvelte_vuelte/src/lib.rs',
		'rsvelte_vuelte/src/template.rs',
		'rsvelte_markup/src/button_type.rs',
		'rsvelte_command_line/src/benchmark.rs',
		'rsvelte_command_line/src/performance.rs'
	].map((file) => {
		const parts = file.split('/');
		return { key: `${CRATES[parts[0]]}/${parts.slice(parts[1] === 'src' ? 2 : 1).join('/').slice(0, -3)}`, file };
	});
	return [...kernel, ...examples];
}
