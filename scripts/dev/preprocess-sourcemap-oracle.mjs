// Prints the source maps official `preprocess()` produces for the scenarios the
// preprocess source-map tests assert on, so the expectations are the oracle's
// numbers rather than ours. Run: node scripts/dev/preprocess-sourcemap-oracle.mjs
import { preprocess } from '../../submodules/svelte/packages/svelte/src/compiler/index.js';

const show = async (label, source, preprocessors, filename) => {
	const result = await preprocess(source, preprocessors, { filename });
	console.log(`=== ${label}`);
	console.log('code:', JSON.stringify(result.code));
	console.log('map:', JSON.stringify(result.map));
	console.log('');
};

// 1. Two markup preprocessors, each returning a map. The composed map must
//    resolve back to the ORIGINAL source, not to stage 1's output.
await show(
	'two-markup-maps',
	'A\nB\nC\n',
	[
		{
			name: 'first',
			markup: () => ({
				code: 'X\nB\nC\n',
				map: {
					version: 3,
					sources: ['input.svelte'],
					names: [],
					mappings: [[[0, 0, 2, 0]], [], [], []]
				}
			})
		},
		{
			name: 'second',
			markup: () => ({
				code: 'Y\nB\nC\n',
				map: {
					version: 3,
					sources: ['input.svelte'],
					names: [],
					mappings: [[[0, 0, 0, 0]], [], [], []]
				}
			})
		}
	],
	'input.svelte'
);

// 2. A multi-byte character before the `<script>` tag: the mapped column is
//    counted in UTF-16 code units, not UTF-8 bytes.
await show(
	'utf16-columns',
	'<p>ボタン</p><script>let a=1;</script>',
	[
		{
			name: 'script',
			script: () => ({
				code: 'let b=1;',
				map: {
					version: 3,
					sources: ['input.svelte'],
					names: [],
					mappings: [[[0, 0, 0, 0]]]
				}
			})
		}
	],
	'input.svelte'
);

// 3. A preprocessor that attaches its map to the code instead of returning it.
const attached = Buffer.from(
	JSON.stringify({
		version: 3,
		sources: ['input.svelte'],
		names: [],
		mappings: 'AAAA'
	})
).toString('base64');
await show(
	'attached-sourcemap',
	'<script>let a=1;</script>',
	[
		{
			name: 'attach',
			script: () => ({
				code: `let b=1;\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,${attached}`
			})
		}
	],
	'input.svelte'
);
