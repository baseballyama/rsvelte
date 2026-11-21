<script>
	import Foo from './Foo.svelte';
	let foo;

	const remove = () => {
		foo.remove();
	};
</script>

<Foo. bind:this={foo} />

<button on:click={() => remove()}>Click Me</button>
