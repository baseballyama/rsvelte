<script>
	export let p = 1;
	let n = 0;
	$: doubled = n * 2;

	function f() {
		$state: for (;;) {
			break $state;
		}
		$derived: for (;;) {
			continue $derived;
		}
		try {
			n += 1;
		} catch ($effect) {
			n = $effect;
		}
	}
</script>

<div>{p} {doubled} {f}</div>
