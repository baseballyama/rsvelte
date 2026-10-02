<script>
	import Foo from '$lib/foo.svelte';
</script>

{#snippet foo()}
	{#snippet bar()} Bar {/snippet}
	Foo {@render bar()}
{/snippet}

<Foo {foo} />
