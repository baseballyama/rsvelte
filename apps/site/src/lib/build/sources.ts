// Which Rust files the site can quote, and the key each is quoted under. Shared by the build plugin
// and by the excerpt test, so a page and its test resolve a key against the same file.

import { readdirSync } from 'node:fs';
import path from 'node:path';

/** Short crate names used in item keys. */
export const CRATES: Record<string, string> = {
	rsv_kernel: 'kernel',
	rsv_svelte: 'svelte',
	rsv_js: 'js',
	rsv_cli: 'cli',
	rsv_vue: 'vue',
	rsv_svue: 'svue',
	rsv_html: 'html'
};

/** Every kernel module, plus the plugin code the guide uses as worked examples. */
export function sources(cratesDir: string): { key: string; file: string }[] {
	const kernel = readdirSync(path.join(cratesDir, 'rsv_kernel/src'))
		.filter((f) => f.endsWith('.rs'))
		.sort()
		.map((f) => ({ key: `kernel/${f.slice(0, -3)}`, file: `rsv_kernel/src/${f}` }));
	const examples = [
		'rsv_kernel/src/doc/width.rs',
		'rsv_svelte/src/lib.rs',
		'rsv_svelte/src/ast.rs',
		'rsv_svelte/src/parse.rs',
		'rsv_svelte/src/tasks.rs',
		'rsv_svelte/src/lint.rs',
		'rsv_svelte/src/resolve.rs',
		'rsv_svelte/src/hir.rs',
		'rsv_svelte/src/project.rs',
		'rsv_js/src/ast.rs',
		'rsv_js/src/lexer.rs',
		'rsv_js/src/parser.rs',
		'rsv_js/src/lint.rs',
		'rsv_js/src/check.rs',
		'rsv_vue/src/lib.rs',
		'rsv_vue/src/ast.rs',
		'rsv_vue/src/tasks.rs',
		'rsv_vue/src/lint.rs',
		'rsv_svue/src/lib.rs',
		'rsv_svue/src/template.rs',
		'rsv_html/src/button_type.rs',
		'rsv_cli/src/bench.rs',
		'rsv_cli/src/perf.rs'
	].map((file) => {
		const parts = file.split('/');
		return { key: `${CRATES[parts[0]]}/${parts.at(-1)!.slice(0, -3)}`, file };
	});
	return [...kernel, ...examples];
}
