<script>
	let a = $state(1);
	let d = $derived(a * 2);

	function f() {
		$inspect(a);
		$inspect(d);
		$inspect(a, a + 1);
		$inspect(a).with(console.log);
		$effect(() => a);
	}

	if (a) {
		$inspect(a);
	}

	class C {
		m() {
			$inspect(d);
		}
	}

	f();
	new C().m();
</script>

<b>{a}{d}</b>
