<script>
let base = $state(1);
let out = 0;
for (let d = $derived(base + 1); d < 4; out += d) {
	out += d;
	const read = () => d;
	read();
	break;
}
</script>

<p>ok</p>
