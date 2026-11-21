<script>
	let foo;

	const remove = () => {
		foo.remove();
	};
</script>

<Foo-bar bind:this={foo}>div</Foo-bar>

<button on:click={() => remove()}>Click Me</button>
