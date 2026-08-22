<script>
	import Inner from './Inner.svelte';

	export let rows = [];
</script>

<Inner {rows}>
	<svelte:fragment slot="header" let:sorted>
		<th>{sorted ? 'v' : '^'}</th>
	</svelte:fragment>
	<tr slot="row" let:row let:index={i}>
		<td>{row}:{i}</td>
	</tr>
	fallback body
	{#if $$slots.footer}
		<slot name="footer" />
	{/if}
</Inner>

<slot count={rows.length} {rows}>
	<p>default fallback with {$$restProps.title ?? 'none'}</p>
</slot>
