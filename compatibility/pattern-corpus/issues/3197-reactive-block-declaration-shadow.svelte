<script>
	export let a = 1;
	let d = 0;
	let e = 0;
	let f = 0;
	let g = 0;
	let h = 0;
	$: {
		let e = a;
		d = e;
	}
	$: {
		function f() {
			return a;
		}
		d += f();
	}
	$: {
		class g {}
		d += g ? 1 : 0;
	}
	$: {
		for (const h of [a]) d += h;
	}
	$: e = d + 1;
	$: f = d + 2;
	$: g = d + 3;
	$: h = d + 4;
</script>

<b>{d}{e}{f}{g}{h}</b>
