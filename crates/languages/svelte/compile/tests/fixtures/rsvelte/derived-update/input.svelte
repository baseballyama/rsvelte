<script>
	let count = $derived(0);
	let after = count++;
	let before = --count;
</script>

<p>{after} {before} {count}</p>
