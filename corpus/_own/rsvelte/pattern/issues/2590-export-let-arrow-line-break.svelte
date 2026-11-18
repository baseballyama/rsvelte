<script>
	export let fmt = (n) =>
		`${n} items`;
	export let label = "a =>";
	export let other = 1;
</script>

<p>{fmt(1)}{label}{other}</p>
