export const guideSections = [
	{ id: 'try', title: 'ブラウザで試す' },
	{ id: 'setup', title: '手元で使う準備' },
	{ id: 'compile', title: 'コンパイルする' },
	{ id: 'format', title: 'ソースを整形する' },
	{ id: 'lint', title: '問題を見つける' },
	{ id: 'check', title: '型をチェックする' },
	{ id: 'browser', title: 'Web アプリに組み込む' },
	{ id: 'limits', title: '現在の制約と困ったとき' }
];

export const guideExamples = {
	setup: 'git clone --branch experimental https://github.com/baseballyama/rsvelte.git\ncd rsvelte\ncargo build --release -p rsvelte_command_line',
	source: '<script>\n  let count = $state(0);\n</script>\n\n<button type="button" onclick={() => count++}>\n  {count}\n</button>',
	compile: './target/release/rsvelte run Counter.svelte --task svelte.compile/client',
	server: './target/release/rsvelte run Counter.svelte --task svelte.compile/server',
	format: './target/release/rsvelte run Counter.svelte --task svelte.format/default',
	lint: './target/release/rsvelte run Counter.svelte --task svelte.lint/default',
	combined: './target/release/rsvelte run Counter.svelte \\\n  --task svelte.format/default --task svelte.lint/default',
	typedSource: '<script lang="ts">\n  let count: number = $state("zero");\n</script>\n\n<p>{count}</p>',
	checkSetup: 'cargo install --path crates/languages/typescript/content_mapper\nnpm install --prefix typecheck-tools typescript@7.1.0-dev.20261003.1 svelte@5.57.1\nnode --input-type=module -e "import getExePath from \'./typecheck-tools/node_modules/typescript/lib/getExePath.js\'; console.log(getExePath());"',
	check: './target/release/rsvelte run Counter.svelte \\\n  --task svelte.check/default \\\n  --tsc /absolute/path/to/native/tsc \\\n  --svelte /absolute/path/to/project/node_modules/svelte \\\n  --tsconfig /absolute/path/to/project/tsconfig.json',
	wasmBuild: 'rustup target add wasm32-unknown-unknown\ncargo install wasm-pack --version 0.14.0 --locked\nwasm-pack build crates/hosts/browser --target web --release \\\n  --out-dir ../../../browser-package --out-name rsvelte_kernel_browser',
	wasmUse: "import init, { runPipeline } from './browser-package/rsvelte_kernel_browser.js';\n\nawait init();\nconst result = JSON.parse(runPipeline(\n  '<p>Hello</p>', 'App.svelte', 'svelte', 'compile-client,lint', true\n));\n\nif (!result.ok) {\n  throw new Error(result.message);\n}\nfor (const step of result.steps) {\n  console.log(step.files, step.diagnostics);\n}"
};
