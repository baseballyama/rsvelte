<script>
	import C from './C.svelte';

	let n = $state(1);
	const spread = { id: 'x' };
</script>

<C>
	<svelte:fragment slot="s">
		<b class="plain">{n}</b>
		<i class:on={n > 0}>{n}</i>
		<u style:color="red">{n}</u>
		<s {...spread}>{n}</s>
		<em>{n}</em>
	</svelte:fragment>
</C>

<svelte:boundary>
	<b class:on={n > 0}>{n}</b>
	<i style:color="red">{n}</i>
</svelte:boundary>

<style>
	b {
		color: red;
	}

	.plain {
		color: blue;
	}

	.on {
		font-weight: bold;
	}
</style>
