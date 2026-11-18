<script>
	import Inner from './legacy-module-and-dollar-dollar.svelte';
</script>

<Inner a={1}>
	<svelte:fragment slot="header">
		<h1>header</h1>
	</svelte:fragment>
	<svelte:fragment slot="footer" />
	<span slot="unnamed-is-default">x</span>
</Inner>

<Inner let:a let:b>
	<p>{a}{b}</p>
</Inner>
