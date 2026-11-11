<script>
	const autofocus = () => Promise.resolve(true);
	const handler = () => Promise.resolve(() => {});
</script>

<input autofocus={await autofocus()} />
<button onclick={await handler()}>click</button>
