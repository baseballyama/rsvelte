<script lang="ts">
	import Figure from '$lib/components/Figure.svelte';
	import { ARTIFACTS, computeCounts, simulate, TASKS, type ArtifactName, type TaskId } from '$lib/kernel/artifacts-sim';

	let selected: TaskId[] = $state([...TASKS]);
	let sharing: 'shared' | 'isolated' = $state('shared');
	let parses = $state(true);

	const traces = $derived(simulate(selected, { parses }, sharing));
	const counts = $derived(computeCounts(traces));
	const artifacts = ARTIFACTS;
	const artifactLabels: Record<ArtifactName, string> = {
		'svelte.parse': '構文解析',
		'svelte.resolve': '名前の参照先の解析',
		'svelte.compiler_syntax_tree': 'コンパイル用の構文木',
		'svelte.analyze': '意味の解析',
		'svelte.css': 'スタイルシートの解析',
		'ts.view': '型検査用のコード'
	};
	const taskLabels: Record<TaskId, string> = {
		'svelte.compile/client': 'ブラウザ向けのコンパイル',
		'svelte.compile/server': 'サーバー向けのコンパイル',
		'svelte.format/default': 'コードの整形',
		'svelte.lint/default': 'コードの問題の検査',
		'svelte.check/default': '型の検査'
	};
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

<Figure label="図 4.1 · 一つの文書を五つのタスクで処理したときの計算記録" wide>
	{#snippet controls()}
		<button type="button" class="btn-ghost" aria-pressed={sharing === 'shared'} onclick={() => (sharing = 'shared')}>計算結果を共有する場合</button>
		<button type="button" class="btn-ghost" aria-pressed={sharing === 'isolated'} onclick={() => (sharing = 'isolated')}>タスクごとに計算する場合</button>
		<button type="button" class="btn-ghost" aria-pressed={!parses} onclick={() => (parses = !parses)}>パース失敗</button>
	{/snippet}
	<div class="grid lg:grid-cols-[minmax(0,1fr)_220px]">
		<ol class="min-w-0 divide-y divide-line border-b border-line lg:border-r lg:border-b-0">
			{#each TASKS as t (t)}
				{@const trace = traces.find((x) => x.task === t)}
				<li class={['grid grid-cols-[24px_minmax(0,1fr)] items-start gap-x-3 gap-y-1.5 px-4 py-2.5 sm:grid-cols-[24px_minmax(0,210px)_minmax(0,1fr)]', !trace && 'opacity-45']}>
					<input
						type="checkbox"
						class="mt-1.5 accent-[var(--fg)]"
						checked={selected.includes(t)}
						onchange={() => toggle(t)}
						aria-label="{taskLabels[t]} を走らせる"
					/>
					<span class="pt-0.5 text-[12.5px] leading-[1.6]" title={t}>{taskLabels[t]}</span>
					<div class="col-start-2 flex flex-wrap gap-1.5 sm:col-start-3">
						{#if trace}
							{#each trace.gets as g, k (k)}
								<span
									class="inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 font-mono text-[11px] tracking-normal whitespace-nowrap"
									style:margin-left="{g.depth * 10}px"
									style:border-color={g.computed ? hue[g.artifact] : 'var(--border)'}
									style:color={g.computed ? hue[g.artifact] : 'var(--muted)'}
									title={g.depth > 0 ? '別の計算の途中で求められた結果' : ''}
								>
									{g.depth > 0 ? '↳ ' : ''}{artifactLabels[g.artifact]}
									<span class={g.computed ? 'font-medium' : ''}>{g.computed ? '計算' : 'キャッシュ'}</span>
								</span>
							{/each}
							{#if trace.gets.length === 0}<span class="text-[13px] text-muted">—</span>{/if}
						{/if}
					</div>
				</li>
			{/each}
		</ol>
		<div class="p-4 font-mono text-[12.5px] tracking-normal">
			<div class="text-muted">計算の回数</div>
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
			<div class="mt-4 text-muted">計算結果の管理領域の数</div>
			<div class="mt-1 tnum">{sharing === 'shared' ? 1 : traces.length}</div>
		</div>
	</div>
	{#snippet caption()}
		各行は、そのタスクが <code>context.get</code>（check は <code>context.facet</code>）を呼んだ順です。字下げした札は、別の計算結果の
		<code>compute</code> の中から呼ばれた <code>get</code> です。<code>ts.view</code> は計算結果ではなく共通の呼び出し窓口ですが、同じ
		配列の位置の表にキャッシュされます。呼び出しの順は <code>rsvelte_svelte</code> の <code>tasks.rs</code>・<code>lib.rs</code> と
		<code>rsvelte_javascript</code> の <code>check.rs</code> から書き写したモデルです。実際の Rust を動かしているわけではありません。
	{/snippet}
</Figure>
