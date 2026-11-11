<!-- svelte-ignore non_reactive_update -->
<div></div>
<script>
	let runes = $state(0);
	let noisy;
	noisy = 0;
</script>

<button onclick={() => (runes = noisy += 1)}>{noisy}</button>
