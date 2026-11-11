<script>
	export let count;
	let a, b, c, d;
	$: {
		for (let i = 0; i < count; i++) a = i;
	}
	$: {
		while (count > 100) b = count;
	}
	$: {
		try {
			c = count;
		} catch {
			c = 0;
		}
	}
	$: {
		switch (count) {
			default:
				d = count;
		}
	}
</script>

{a}{b}{c}{d}
