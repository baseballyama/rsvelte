<script>
	/* svelte-ignore non_reactive_update */
	let n = 0;
	function inc() {
		n += 1;
	}
	/*
	 * svelte-ignore a11y_missing_attribute
	 */
	let unrelated = 1;
	void [inc, unrelated];
</script>
<button onclick={inc}>{n}</button>
