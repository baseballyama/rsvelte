<!-- svelte-ignore a11y_missing_attribute -->
<!-- svelte-ignore non_reactive_update -->
<script>
	let runes = $state(0);
	let silenced;
	silenced = 0;
</script>

<button onclick={() => (runes = silenced += 1)}>{silenced}</button>
