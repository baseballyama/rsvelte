<script lang="ts">
	import Figure from '$lib/components/Figure.svelte';
	import { account, type Span } from '$lib/kernel/metrics-sim';

	/** Average self microseconds per call of each phase, from a metrics bench report. */
	let { avg, rev }: { avg: Record<string, number>; rev: string } = $props();

	let formatFirst = $state(false);
	let hovered: string | null = $state(null);

	const need = (name: string) => {
		const v = avg[name];
		if (v === undefined) throw new Error(`no phase ${name} in the report`);
		return v;
	};

	// One parsed document, the four bench tasks, in registration order (or format first).
	const roots = $derived.by(() => {
		let t = 0;
		const span = (name: string, children: () => Span[]): Span => {
			const start = t;
			t += need(name) / 2;
			const kids = children();
			t += need(name) / 2;
			return { name, start, end: t, allocs: 0, children: kids };
		};
		let parsed = false;
		const parse = () => {
			if (parsed) return [];
			parsed = true;
			return [span('svelte.parse', () => [])];
		};
		let analyzed = false;
		const analyze = () => {
			if (analyzed) return [];
			analyzed = true;
			return [span('svelte.analyze', () => [])];
		};
		let css = false;
		const scoped = () => {
			if (css) return [];
			css = true;
			return [span('svelte.css', () => [])];
		};
		const compile = (target: 'client' | 'server') =>
			span(`svelte.compile/${target}`, () => [
				...parse(),
				...analyze(),
				...scoped(),
				span(`svelte.lower.${target}`, () => []),
				span('js.print', () => [])
			]);
		const format = () => span('svelte.format/default', () => [...parse()]);
		const lint = () =>
			span('svelte.lint/default', () => [
				...parse(),
				...analyze(),
				span('js.parents', () => []),
				span('no-unused-vars', () => []),
				span('svelte/button-has-type', () => [])
			]);
		return formatFirst ? [format(), compile('client'), compile('server'), lint()] : [compile('client'), compile('server'), format(), lint()];
	});
	const rows = $derived(account(roots));
	const T = $derived(roots.at(-1)!.end);

	const flat = $derived.by(() => {
		const out: { s: Span; depth: number }[] = [];
		const walk = (s: Span, depth: number) => {
			out.push({ s, depth });
			s.children.forEach((c) => walk(c, depth + 1));
		};
		roots.forEach((r) => walk(r, 0));
		return out;
	});
	const tone = (name: string) =>
		name.startsWith('svelte.parse') || name === 'svelte.analyze' || name === 'svelte.css'
			? 'var(--c-src)'
			: name.includes('/') && name.startsWith('svelte.') && !name.startsWith('svelte/')
				? 'var(--c-idle)'
				: 'var(--c-gen)';
	const W = 700;
	const x = (v: number) => (v / T) * W;
</script>

<Figure label="図 11.1 · 1 文書のフェーズ" wide>
	{#snippet controls()}
		<button type="button" class="btn-ghost" aria-pressed={!formatFirst} onclick={() => (formatFirst = false)}>登録順</button>
		<button type="button" class="btn-ghost" aria-pressed={formatFirst} onclick={() => (formatFirst = true)}>format を先に</button>
	{/snippet}
	<div class="overflow-x-auto p-4">
		<svg viewBox="0 0 {W} {4 * 22}" class="h-auto w-full min-w-[560px]" role="img">
			<title>フェーズの入れ子。横軸は時間</title>
			{#each flat as { s, depth }, i (i)}
				<g
					role="presentation"
					onmouseenter={() => (hovered = s.name)}
					onmouseleave={() => (hovered = null)}
					opacity={hovered && hovered !== s.name ? 0.35 : 1}
				>
					<rect x={x(s.start)} y={depth * 22} width={Math.max(x(s.end) - x(s.start) - 1, 1)} height="19" rx="2" fill={tone(s.name)} opacity="0.85" />
					{#if x(s.end) - x(s.start) > 60}
						<text x={x(s.start) + 4} y={depth * 22 + 13} class="font-mono" font-size="10.5" fill="var(--bg)">{s.name}</text>
					{/if}
				</g>
			{/each}
		</svg>
		<table class="table mt-4 text-[13px]">
			<thead><tr><th>フェーズ</th><th class="num">total µs</th><th class="num">self µs</th><th class="w-[35%]">self の割合</th></tr></thead>
			<tbody>
				{#each [...rows].sort((a, b) => b.selfNs - a.selfNs) as r (r.name)}
					<tr
						class={hovered === r.name ? 'bg-accent-wash' : ''}
						onmouseenter={() => (hovered = r.name)}
						onmouseleave={() => (hovered = null)}
					>
						<td><code>{r.name}</code></td>
						<td class="num">{r.totalNs.toFixed(1)}</td>
						<td class="num">{r.selfNs.toFixed(1)}</td>
						<td class="align-middle">
							<div class="h-1.5 bg-surface"><div class="h-1.5" style:width="{(r.selfNs / T) * 100}%" style:background={tone(r.name)}></div></div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	{#snippet caption()}
		各フェーズの長さは、ベンチマーク（build {rev.slice(0, 7)}、metrics あり）のフェーズ表の「そのフェーズ 1 回あたりの平均 self 時間」です。並べ方は <code>run_document</code>
		と各タスクのコードに従ったモデルです。「format を先に」にしても <code>svelte.parse</code> の self は変わらず、変わるのはどのタスクの
		total にパースが含まれるかだけです。
	{/snippet}
</Figure>
