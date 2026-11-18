<script>
	let a = $state(1);
	let d = $derived(a * 2);
	let e = $derived.by(() => a);
	function f() {
		d = 5;
		d += 1;
		e ||= 3;
	}
</script>
<button onclick={() => (d = !d)}>{d}{e}</button>
