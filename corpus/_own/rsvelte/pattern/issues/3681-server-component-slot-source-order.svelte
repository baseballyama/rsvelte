<script>
	import C from './C.svelte';
	let a = [1];
</script>

<C><i slot="b">
	{#each a as b}{b}{/each}
</i><i>
	{#each a as b}{b}{/each}
</i></C>
