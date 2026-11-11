<script>
	import C from './C.svelte';
	let x = $state(1);
</script>
<C>
	<div slot="a">{x}</div>
	hello {x}
	<C slot="1" a={x} />
	<span slot="0" class:x>s</span>
	{#snippet foo()}f{/snippet}
</C>
<C>
	<svelte:fragment slot="b">
		<span>{x}</span>
	</svelte:fragment>
	<svelte:fragment slot="c"><svg><rect /></svg></svelte:fragment>
</C>
<C><svelte:fragment>plain {x}</svelte:fragment></C>
<button onclick={() => x++}></button>
