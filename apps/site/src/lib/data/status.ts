// Correctness against the upstream tools, as recorded in docs/architecture.md §4. Each block names
// the revision it was measured at; update the block and its revision together.

export const units = {
	source: 'docs/architecture.md §4',
	population: 'fixtures/svelte/rsvelte（手書き 12 ユニット）',
	rows: [
		{ task: 'svelte.compile/client · server', oracle: 'svelte 5.57.1', result: '14/14', note: 'JS と CSS の行が一致' },
		{
			task: 'svelte.format/default',
			oracle: 'prettier 3.9.9 + prettier-plugin-svelte 4.1.1',
			result: '11/12',
			note: 'check-cases は { label: string } 型を整形できず拒否'
		},
		{
			task: 'svelte.lint/default',
			oracle: 'eslint 10.11.0 + eslint-plugin-svelte 3.23.0',
			result: '12/12',
			note: 'オラクルは全 282 ルール。rsvelte が実装した 2 ルールの指摘を比較'
		},
		{
			task: 'svelte.check/default',
			oracle: 'svelte-check 4.7.6 + typescript 6.0.3',
			result: '12/12',
			note: 'rsvelte 側は tsc 7.0.2。属性の型エラー 6 件と {#if} による絞り込みを含む'
		}
	]
};

export const corpus = {
	source: 'docs/architecture.md §4',
	rev: '76c177cbdd',
	population: 'fixtures/svelte 全体、17,487 ユニット、client',
	units: 17487,
	emitted: 4656,
	matched: 1040,
	mismatched: 3524,
	unparseable: 92,
	missing: 12831
};
