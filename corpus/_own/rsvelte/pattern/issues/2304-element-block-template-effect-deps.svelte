<script>
	let scroll = $state({ progress: { x: 0, y: 0 } });
</script>

<div>
	{#snippet unit()}
		<em>%</em>
	{/snippet}
	{@render unit()}
	<p>{scroll.progress.x.toFixed(0)}%</p>
	<p>{scroll.progress.y.toFixed(0)}%</p>
</div>

<section>
	{const scale = 2}
	<p>{scroll.progress.x.toFixed(scale)}</p>
	<p>{scroll.progress.y.toFixed(scale)}</p>
</section>
