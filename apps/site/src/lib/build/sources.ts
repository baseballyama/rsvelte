// Which Rust files the site can quote, and the key each is quoted under. Shared by the build plugin
// and by the excerpt test, so a page and its test resolve a key against the same file.

import { readdirSync } from 'node:fs';
import path from 'node:path';

/** Role names used in item keys. */
export const CRATES: Record<string, string> = {
	rsvelte_kernel: 'kernel',
	rsvelte_lint_runner: 'lint',
	rsvelte_document_printer: 'document_printer',
	rsvelte_command_line: 'command_line',
	rsvelte_example_plugin: 'example_plugin',
	rsvelte_markup_lint: 'html',
	rsvelte_svelte_syntax: 'svelte',
	rsvelte_typescript_syntax: 'typescript',
	rsvelte_vue_syntax: 'vue',
	rsvelte_vue_compile_svelte: 'svue',
	rsvelte_svelte_compile_vapor: 'vuelte',
};

/** Every kernel module, plus the plugin code the guide uses as worked examples. */
export function sources(cratesDir: string): { key: string; file: string }[] {
	const kernel = readdirSync(path.join(cratesDir, 'language_independent/kernel/src'), {
		recursive: true,
		encoding: 'utf8',
	})
		.filter((file) => file.endsWith('.rs'))
		.toSorted()
		.map((file) => ({
			key: `kernel/${file.replaceAll(path.sep, '/').replace(/(?:\/mod)?\.rs$/, '')}`,
			file: `language_independent/kernel/src/${file}`,
		}));
	const groups: [string, string, string[]][] = [
		[
			'lint',
			'language_independent/lint_runner/src',
			['rule', 'findings', 'findings/tests', 'output', 'output/tests'],
		],
		[
			'document_printer',
			'language_independent/document_printer/src',
			['lib', 'construct', 'printer', 'rewrite', 'tests', 'width'],
		],
		[
			'typescript/syntax',
			'languages/typescript/syntax/src',
			['lexer', 'lexer/tests', 'parser', 'syntax_tree'],
		],
		['typescript/check', 'languages/typescript/check/src', ['check', 'check/report']],
		['svelte/syntax', 'languages/svelte/syntax/src', ['syntax_tree', 'parse', 'computation']],
		[
			'svelte/semantic',
			'languages/svelte/semantic/src',
			[
				'computation',
				'resolve',
				'compiler_syntax_tree',
				'compiler_syntax_tree/builder',
				'compiler_syntax_tree/lower',
			],
		],
		['svelte/format', 'languages/svelte/format/src', ['task']],
		[
			'svelte/lint',
			'languages/svelte/lint/src',
			[
				'task',
				'lint',
				'rules',
				'rules/button_has_type',
				'rules/no_unused_variables',
				'rules/valid_each_key',
			],
		],
		['svelte/compile', 'languages/svelte/compile/src', ['task', 'computation']],
		['svelte/check', 'languages/svelte/check/src', ['registration']],
		[
			'svelte/typescript_projection',
			'languages/svelte/typescript_projection/src',
			['computation', 'syntax_tree', 'lower', 'emit'],
		],
		['vue/syntax', 'languages/vue/syntax/src', ['syntax_tree', 'computation']],
		['vue/semantic', 'languages/vue/semantic/src', ['computation']],
		['vue/lint', 'languages/vue/lint/src', ['lint']],
		['vue/check', 'languages/vue/check/src', ['registration']],
		[
			'svue',
			'languages/vue/compile_svelte/src',
			['lib', 'computation', 'compilation', 'compilation/template/attributes'],
		],
		[
			'vuelte',
			'languages/svelte/compile_vapor/src',
			['lib', 'computation', 'compilation/vapor/elements', 'compilation/template/bindings'],
		],
		['html/lint', 'languages/html/lint/src', ['button_type']],
		['command_line', 'hosts/command_line/src', ['commands/benchmark', 'commands/performance']],
		['example_plugin', '../examples/plugin', ['src/lib', 'examples/host']],
	];
	return [
		...kernel,
		...groups.flatMap(([key, directory, modules]) =>
			modules.map((module) => ({
				key: `${key}/${module}`,
				file: `${directory}/${module}.rs`,
			})),
		),
	];
}
