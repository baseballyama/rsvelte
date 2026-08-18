<script>
	const s = '{#snippet children()}';
</script>

<div data-x={s} title="{'{#snippet children()}'}">
	{#snippet childrenExtra()}
		<p>a</p>
	{/snippet}
	{@render childrenExtra()}
</div>
