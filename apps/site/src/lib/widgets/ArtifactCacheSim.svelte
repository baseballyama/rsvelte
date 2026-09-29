<script lang="ts">
	import Figure from '$lib/components/Figure.svelte';
	import { ARTIFACTS, computeCounts, simulate, TASKS, type ArtifactName, type TaskId } from '$lib/kernel/artifacts-sim';

	let selected: TaskId[] = $state([...TASKS]);
	let sharing: 'shared' | 'isolated' = $state('shared');
	let parses = $state(true);
	let checkConfigured = $state(true);

	const traces = $derived(simulate(selected, { parses, checkConfigured }, sharing));
	const counts = $derived(computeCounts(traces));
	const artifacts = ARTIFACTS;
	// The layer hues of figure 5.1: surface, resolution, HIR; the rest are neutral.
	const hue: Record<ArtifactName, string> = {
		'svelte.parse': 'var(--c-src)',
		'svelte.resolve': 'var(--c-map)',
		'svelte.hir': 'var(--c-gen)',
		'svelte.analyze': 'var(--c-idle)',
		'svelte.css': 'var(--fg-2)',
		'svelte.project.ts': 'var(--fg-2)'
	};

	function toggle(t: TaskId) {
		selected = selected.includes(t) ? selected.filter((x) => x !== t) : [...selected, t];
	}
</script>

<Figure label="図 4.1 · 1 文書、5 タスク、Ctx::get の記録" wide>
	{#snippet controls()}
		<button type="button" class="btn-ghost" aria-pressed={sharing === 'shared'} onclick={() => (sharing = 'shared')}>Shared</button>
		<button type="button" class="btn-ghost" aria-pressed={sharing === 'isolated'} onclick={() => (sharing = 'isolated')}>Isolated</button>
		<button type="button" class="btn-ghost" aria-pressed={!parses} onclick={() => (parses = !parses)}>パース失敗</button>
		<button type="button" class="btn-ghost" aria-pressed={!checkConfigured} onclick={() => (checkConfigured = !checkConfigured)}
			>check 未設定</button
		>
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
						aria-label="{t} を走らせる"
					/>
					<code class="pt-0.5 text-[12.5px] leading-[1.6]">{t}</code>
					<div class="col-start-2 flex flex-wrap gap-1.5 sm:col-start-3">
						{#if trace}
							{#each trace.gets as g, k (k)}
								<span
									class="inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 font-mono text-[11px] tracking-normal whitespace-nowrap"
									style:margin-left="{g.depth * 10}px"
									style:border-color={g.computed ? hue[g.artifact] : 'var(--border)'}
									style:color={g.computed ? hue[g.artifact] : 'var(--muted)'}
									title={g.depth > 0 ? '別のアーティファクトの compute の中から呼ばれた get' : ''}
								>
									{g.depth > 0 ? '↳ ' : ''}{g.artifact.replace('svelte.', '')}
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
			<div class="text-muted">compute の回数</div>
			<table class="mt-2 w-full">
				<tbody>
					{#each artifacts as a (a)}
						<tr>
							<td class="py-0.5" style:color={hue[a]}>{a}</td>
							<td class="py-0.5 text-right tnum">{counts[a]}</td>
						</tr>
					{/each}
				</tbody>
			</table>
			<div class="mt-4 text-muted">Ctx の数</div>
			<div class="mt-1 tnum">{sharing === 'shared' ? 1 : traces.length}</div>
		</div>
	</div>
	{#snippet caption()}
		各行は、そのタスクが <code>ctx.get</code> を呼んだ順です。字下げした札は、別のアーティファクトの <code>compute</code>
		の中から呼ばれた <code>get</code> です。呼び出しの順は <code>rsv_svelte</code> の <code>tasks.rs</code> と
		<code>lib.rs</code> から書き写したモデルで、実際の Rust を動かしているわけではありません。
	{/snippet}
</Figure>
