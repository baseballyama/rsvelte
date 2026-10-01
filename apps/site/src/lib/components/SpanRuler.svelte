<script module lang="ts">
	export interface RulerMark {
		startOffset: number;
		endOffset: number;
		tone: 'accent' | 'source' | 'gen' | 'muted';
	}
</script>

<script lang="ts">
	let {
		length,
		marks = [],
		unit = 'B',
		tick = 8,
		label = 32,
		title
	}: {
		/** The quantity the ruler spans: bytes, columns or milliseconds. */
		length: number;
		marks?: RulerMark[];
		unit?: string;
		tick?: number;
		label?: number;
		title: string;
	} = $props();

	const W = 1000;
	const x = (v: number) => (v / Math.max(length, 1)) * W;
	const ticks = $derived(Array.from({ length: Math.floor(length / tick) + 1 }, (_, i) => i * tick));
	const color = { accent: 'var(--accent)', source: 'var(--c-src)', gen: 'var(--c-gen)', muted: 'var(--muted)' };
</script>

<svg viewBox="0 0 {W} 30" preserveAspectRatio="none" class="block h-[30px] w-full overflow-visible" role="img">
	<title>{title}</title>
	<line x1="0" x2={W} y1="10" y2="10" stroke="var(--border-strong)" vector-effect="non-scaling-stroke" />
	{#each ticks as t (t)}
		<line
			x1={x(t)}
			x2={x(t)}
			y1={t % label === 0 ? 4 : 7}
			y2="10"
			stroke="var(--border-strong)"
			vector-effect="non-scaling-stroke"
		/>
	{/each}
	{#each marks as m, i (i)}
		<rect
			x={x(m.startOffset)}
			y="3"
			width={Math.max(x(m.endOffset) - x(m.startOffset), 2)}
			height="8"
			fill={color[m.tone]}
			opacity={m.tone === 'muted' ? 0.35 : 0.9}
		/>
	{/each}
</svg>
<div class="relative h-4 font-mono text-[11px] leading-4 tracking-normal text-muted tnum" aria-hidden="true">
	{#each ticks.filter((t) => t % label === 0 && length - t > label / 2) as t (t)}
		<span class="absolute -translate-x-1/2 first:translate-x-0" style:left="{(t / Math.max(length, 1)) * 100}%"
			>{t}</span
		>
	{/each}
	<span class="absolute right-0">{length} {unit}</span>
</div>
