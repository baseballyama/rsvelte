<script>
	export let a = 1;
	let d = 0;
	let e = 0;
	let f = 0;
	let h = 0;
	let i = 0;
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
		for (const h of [a]) d += h;
	}
	$: switch (a) {
		case 1:
			let i = 2;
			d += i;
	}
	$: e = d + 1;
	$: f = d + 2;
	$: h = d + 4;
	$: i = d + 5;
</script>

<b>{d}{e}{f}{h}{i}</b>

