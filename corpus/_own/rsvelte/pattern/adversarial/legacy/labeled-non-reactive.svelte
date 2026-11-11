<script>
	export let n = 0;
	let hits = 0;
	function scan() {
		outer: for (let i = 0; i < n; i += 1) {
			for (let j = 0; j < i; j += 1) {
				if (j === 2) continue outer;
				if (i * j > 9) break outer;
				hits += 1;
			}
		}
		return hits;
	}
	$: total = scan() + n;
</script>

<p>{total}</p>
