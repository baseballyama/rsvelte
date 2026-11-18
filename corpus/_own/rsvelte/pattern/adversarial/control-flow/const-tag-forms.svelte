<script>
	let rows = $state([{ w: 3, h: 4 }]);
</script>

{#each rows as row}
	{@const area = row.w * row.h}
	{@const { w, h = w } = row}
	{@const [diag] = [Math.hypot(w, h)]}
	{@const describe = (unit = 'px') => `${area}${unit}`}
	{@const nested = { fn: () => ({ deep: area }) }}
	<p>{area}:{diag.toFixed(1)}:{describe('em')}:{nested.fn().deep}</p>
{/each}

{#if rows.length}
	{@const first = rows[0]}
	<p>{first.w}</p>
{/if}
