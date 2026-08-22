<script>
	/* eslint svelte/no-inner-declarations: ["warn", "both"] */
	const cond = true;
</script>

<button
	onclick={() => {
		if (cond) {
			var trapped = 1;
		}
	}}>x</button
>
