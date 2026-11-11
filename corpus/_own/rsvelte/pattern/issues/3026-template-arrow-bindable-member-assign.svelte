<script>
	let { state = $bindable() } = $props();
</script>

<button
	onclick={() => {
		state.a = state.b;
	}}>go</button
>
