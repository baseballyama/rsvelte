<script>
	let base = $state(1);
	let v = $derived(base);

	function sites() {
		{
			var a = typeof v;
		}
		if (base) {
			var v = 2;
		}
		for (var w = 0; w < 0; ) {}
		for (var x of []) {
		}
		try {
			var y = 1;
		} catch {}
		switch (base) {
			case 1:
				var z = 1;
		}
		while (false) {
			var q = 1;
		}
		return a + v + w + x + y + z + q;
	}

	function nested() {
		function inner() {
			var v = 2;
			return v;
		}
		return typeof v + inner();
	}
</script>

<button
	onclick={() => {
		{
			var v = 2;
		}
		base = (typeof v).length;
	}}
></button>
{sites()}{nested()}{v}
