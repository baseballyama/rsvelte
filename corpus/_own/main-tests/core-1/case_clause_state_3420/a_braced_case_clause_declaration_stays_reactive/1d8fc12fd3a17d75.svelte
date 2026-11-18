<script>
	let a = $state(0);
	function f(k) {
		switch (k) {
			case 1: {
				let s = $state(1);
				s++;
				return s;
			}
		}
	}
</script>

<button onclick={() => a++}>{a}{f(1)}</button>
