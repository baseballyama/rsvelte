<script>
	const c = 1;
	let s = $state(0);

	function warnings() {
		try {
			s;
		} catch (s) {
			void s;
		}
	}

	function mutation() {
		try {
			s += c;
		} catch (c) {
			c = 2;
			void c;
		}
	}
</script>

<button onclick={() => { warnings(); mutation(); }}>{s}</button>
