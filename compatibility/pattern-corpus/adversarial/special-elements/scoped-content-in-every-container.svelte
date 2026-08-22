<script>
	import C from './C.svelte';

	let n = $state(1);
	const sp = { id: 'x' };
	function att(node) {
		node.dataset.a = '1';
	}
</script>

<svelte:component this={C}>
	<b class="plain">{n}</b>
	<i class:on={n > 0}>{n}</i>
	<u style:color="red">{n}</u>
	<s {...sp}>{n}</s>
</svelte:component>

<svelte:boundary>
	<b class="plain" {@attach att}>{n}</b>
	{#snippet failed(e)}
		<i class:on={n > 0}>{e.message}</i>
	{/snippet}
</svelte:boundary>

<C>
	<svelte:fragment slot="s">
		<div>
			<b class="plain">{n}</b>
			<i style:color="red">{n}</i>
		</div>
	</svelte:fragment>
</C>

<svelte:head>
	<title>{n}</title>
	<meta name="x" content={String(n)} />
</svelte:head>

{#snippet local()}
	<b class:on={n > 0} {...sp}>{n}</b>
{/snippet}
{@render local()}

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
