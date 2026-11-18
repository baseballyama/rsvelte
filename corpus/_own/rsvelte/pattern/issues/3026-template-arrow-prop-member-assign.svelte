<script>
	const { state } = $props();
</script>

<button
	onclick={() => {
		state.a = state.b;
	}}>go</button
>
