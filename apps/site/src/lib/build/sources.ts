// Which Rust files the site can quote, and the key each is quoted under. Shared by the build plugin
// and by the excerpt test, so a page and its test resolve a key against the same file.

import { readdirSync } from 'node:fs';
import path from 'node:path';

/** Role names used in item keys. */
export const CRATES: Record<string, string> = {
	rsvelte_kernel: 'kernel',
	rsvelte_lint: 'lint',
	rsvelte_svelte: 'svelte',
	rsvelte_typescript: 'typescript',
	rsvelte_command_line: 'command_line',
	rsvelte_vue: 'vue',
	rsvelte_svue: 'svue',
	rsvelte_svelte_compile_vapor: 'vuelte',
	rsvelte_markup: 'markup'
};

/** Every kernel module, plus the plugin code the guide uses as worked examples. */
export function sources(cratesDir: string): { key: string; file: string }[] {
	const kernel = readdirSync(path.join(cratesDir, 'kernel/src'), { recursive: true, encoding: 'utf8' })
		.filter((file) => file.endsWith('.rs'))
		.sort()
		.map((file) => ({ key: `kernel/${file.replaceAll(path.sep, '/').replace(/(?:\/mod)?\.rs$/, '')}`, file: `kernel/src/${file}` }));
	const groups: [string, string, string[]][] = [
		['lint', 'tooling/lint/src', ['rules', 'output']],
		['typescript', 'languages/typescript/core/src', ['syntax/lexer', 'syntax/lexer/tests', 'syntax/parser', 'syntax/syntax_tree']],
		['typescript/check', 'languages/typescript/check/src', ['check', 'check/report']],
		['svelte', 'languages/svelte/core/src', ['lib', 'computation', 'compilation/normalize']],
		['svelte/syntax', 'languages/svelte/syntax/src/syntax', ['syntax_tree']],
		['svelte/syntax', 'languages/svelte/parser/src/syntax', ['parse']],
		['svelte/semantic', 'languages/svelte/semantic/src/semantic', ['resolve']],
		['svelte/compilation', 'languages/svelte/hir/src/compilation', ['compiler_syntax_tree', 'compiler_syntax_tree/builder']],
		['svelte/format', 'languages/svelte/format/src', ['task']],
		['svelte/lint', 'languages/svelte/lint/src', ['task', 'lint']],
		['svelte/compile', 'languages/svelte/compile/src', ['task', 'computation']],
		['svelte/typecheck', 'languages/svelte/typecheck/src', ['registration']],
		['svelte/typescript_projection', 'languages/svelte/typescript_projection/src', ['computation', 'syntax_tree', 'lower', 'emit']],
		['svelte/parser', 'languages/svelte/parser/src', ['computation']],
		['vue', 'languages/vue/core/src', ['lib', 'syntax/syntax_tree', 'computation/artifacts']],
		['vue/lint', 'languages/vue/lint/src', ['lint']],
		['vue/check', 'languages/vue/check/src', ['registration']],
		['svue', 'languages/vue/compile_svelte/src', ['lib', 'computation', 'compilation', 'compilation/template/attributes']],
		['vuelte', 'languages/svelte/compile_vapor/src', ['lib', 'computation', 'compilation/vapor/elements', 'compilation/template/bindings']],
		['markup', 'languages/html/core/src', ['button_type']],
		['command_line', 'hosts/command_line/src', ['commands/benchmark', 'commands/performance']],
		['svelte/examples', 'hosts/command_line/examples', ['plugin']]
	];
	return [...kernel, ...groups.flatMap(([key, directory, modules]) => modules.map(module => ({
		key: `${key}/${module}`, file: `${directory}/${module}.rs`
	})))];
}
