<script lang="ts">
	let { n, xs }: { n: number; xs: number[] } = $props();
</script>

{#if n}
	{@const startX = (d: { at: Date }) => d.at.getTime()}
	{@const scale = <T,>(x: T): T => x}
	{@const onEnter = (e: PointerEvent) => { const t = e.target as HTMLElement; return t; }}
	{@const inner = (() => { type Row = number; const r: Row = n; return r; })()}
	{@const arr = xs.map<number>((v) => v)}
	<span>{startX({ at: new Date() })}{scale(n)}{onEnter}{inner}{arr.length}</span>
{/if}
