<script lang="ts">
	import Figure from '$lib/components/Figure.svelte';
	import { bilingual } from '$lib/i18n';
	import { readerLang } from '$lib/lang.svelte';
	import { ARTIFACTS, computeCounts, simulate, TASKS, type ArtifactName, type TaskId } from '$lib/kernel/artifacts-sim';

	let selected: TaskId[] = $state([...TASKS]);
	let sharing: 'shared' | 'isolated' = $state('shared');
	let parses = $state(true);

	const traces = $derived(simulate(selected, { parses }, sharing));
	const counts = $derived(computeCounts(traces));
	const artifacts = ARTIFACTS;
	const text = bilingual(
		{
			artifacts: {
				'svelte.parse': '構文解析',
				'svelte.resolve': '名前の参照先の解析',
				'svelte.compiler_syntax_tree': 'コンパイル用の構文木',
				'svelte.analyze': '意味の解析',
				'svelte.css': 'スタイルシートの解析',
				'ts.view': '型検査用のコード'
			} as Record<ArtifactName, string>,
			tasks: {
				'svelte.compile/client': 'ブラウザ向けのコンパイル',
				'svelte.compile/server': 'サーバー向けのコンパイル',
				'svelte.format/default': 'コードの整形',
				'svelte.lint/default': 'コードの問題の検査',
				'svelte.check/default': '型の検査'
			} as Record<TaskId, string>,
			label: '図 4.1 · Svelte の文書で計算結果を共有するモデル',
			shared: '計算結果を共有する場合',
			isolated: 'タスクごとに計算する場合',
			parseFails: 'パース失敗',
			run: (task: string) => `${task} を走らせる`,
			nested: '別の計算の途中で求められた結果',
			computed: '計算',
			cached: 'キャッシュ',
			computeCount: '計算の回数',
			stores: '計算結果の管理領域の数',
			caption:
				'各行は、そのタスクが `context.get`（check は `context.facet`）を呼んだ順です。字下げした札は、別の計算結果の `compute` の中から呼ばれた `get` です。`ts.view` は計算結果ではなく共通の呼び出し窓口ですが、同じ 配列の位置の表にキャッシュされます。呼び出しの順は `rsvelte_svelte` の `tasks.rs`・`lib.rs` と `rsvelte_typescript` の `check.rs` から書き写したモデルです。実際の Rust を動かしているわけではありません。'
		},
		{
			artifacts: {
				'svelte.parse': 'Parse',
				'svelte.resolve': 'Name resolution',
				'svelte.compiler_syntax_tree': 'Syntax tree for compiling',
				'svelte.analyze': 'Analysis',
				'svelte.css': 'Stylesheet analysis',
				'ts.view': 'Code for type checking'
			},
			tasks: {
				'svelte.compile/client': 'Compile for the browser',
				'svelte.compile/server': 'Compile for the server',
				'svelte.format/default': 'Format code',
				'svelte.lint/default': 'Lint code',
				'svelte.check/default': 'Check types'
			},
			label: 'Figure 4.1 · A model of shared results for a Svelte document',
			shared: 'Shared results',
			isolated: 'Computed per task',
			parseFails: 'Parse fails',
			run: (task: string) => `Run: ${task}`,
			nested: 'Requested in the middle of another computation',
			computed: 'computed',
			cached: 'cached',
			computeCount: 'Computations',
			stores: 'Stores for computed results',
			caption:
				'Each row shows the order in which the task calls `context.get` (`context.facet` for the type check). An indented tag is a call made inside the `compute` of another artifact, through `get`. `ts.view` is a facet, not an artifact, but it is cached in the same table of array positions. The call order is a model copied from `rsvelte_svelte` (`tasks.rs` and `lib.rs`) and `rsvelte_typescript` (`check.rs`). It does not run the real Rust code.'
		}
	);
	const t = $derived(text[readerLang()]);
	const artifactLabels = $derived(t.artifacts);
	const taskLabels = $derived(t.tasks);
	// The layer hues of figure 5.1: surface, resolution, HIR; the rest are neutral.
	const hue: Record<ArtifactName, string> = {
		'svelte.parse': 'var(--c-src)',
		'svelte.resolve': 'var(--c-map)',
		'svelte.compiler_syntax_tree': 'var(--c-gen)',
		'svelte.analyze': 'var(--c-idle)',
		'svelte.css': 'var(--fg-2)',
		'ts.view': 'var(--fg-2)'
	};

	function toggle(t: TaskId) {
		selected = selected.includes(t) ? selected.filter((x) => x !== t) : [...selected, t];
	}
</script>

<Figure label={t.label} wide>
	{#snippet controls()}
		<button type="button" class="btn-ghost" aria-pressed={sharing === 'shared'} onclick={() => (sharing = 'shared')}>{t.shared}</button>
		<button type="button" class="btn-ghost" aria-pressed={sharing === 'isolated'} onclick={() => (sharing = 'isolated')}>{t.isolated}</button>
		<button type="button" class="btn-ghost" aria-pressed={!parses} onclick={() => (parses = !parses)}>{t.parseFails}</button>
	{/snippet}
	<div class="grid lg:grid-cols-[minmax(0,1fr)_220px]">
		<ol class="min-w-0 divide-y divide-line border-b border-line lg:border-r lg:border-b-0">
			{#each TASKS as task (task)}
				{@const trace = traces.find((x) => x.task === task)}
				<li class={['grid grid-cols-[24px_minmax(0,1fr)] items-start gap-x-3 gap-y-1.5 px-4 py-2.5 sm:grid-cols-[24px_minmax(0,210px)_minmax(0,1fr)]', !trace && 'opacity-45']}>
					<input
						type="checkbox"
						class="mt-1.5 accent-[var(--fg)]"
						checked={selected.includes(task)}
						onchange={() => toggle(task)}
						aria-label={t.run(taskLabels[task])}
					/>
					<span class="pt-0.5 text-[12.5px] leading-[1.6]" title={task}>{taskLabels[task]}</span>
					<div class="col-start-2 flex flex-wrap gap-1.5 sm:col-start-3">
						{#if trace}
							{#each trace.gets as g, k (k)}
								<span
									class="inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 font-mono text-[11px] tracking-normal whitespace-nowrap"
									style:margin-left="{g.depth * 10}px"
									style:border-color={g.computed ? hue[g.artifact] : 'var(--border)'}
									style:color={g.computed ? hue[g.artifact] : 'var(--muted)'}
									title={g.depth > 0 ? t.nested : ''}
								>
									{g.depth > 0 ? '↳ ' : ''}{artifactLabels[g.artifact]}
									<span class={g.computed ? 'font-medium' : ''}>{g.computed ? t.computed : t.cached}</span>
								</span>
							{/each}
							{#if trace.gets.length === 0}<span class="text-[13px] text-muted">—</span>{/if}
						{/if}
					</div>
				</li>
			{/each}
		</ol>
		<div class="p-4 font-mono text-[12.5px] tracking-normal">
			<div class="text-muted">{t.computeCount}</div>
			<table class="mt-2 w-full">
				<tbody>
					{#each artifacts as a (a)}
						<tr>
							<td class="py-0.5" style:color={hue[a]}>{artifactLabels[a]}</td>
							<td class="py-0.5 text-right tnum">{counts[a]}</td>
						</tr>
					{/each}
				</tbody>
			</table>
			<div class="mt-4 text-muted">{t.stores}</div>
			<div class="mt-1 tnum">{sharing === 'shared' ? 1 : traces.length}</div>
		</div>
	</div>
	{#snippet caption()}
		<!-- Text between backticks is code. -->
		{#each t.caption.split('`') as part, i (i)}{#if i % 2}<code>{part}</code>{:else}{part}{/if}{/each}
	{/snippet}
</Figure>
