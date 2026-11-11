<script>
	const a = 'x';
	const b = 'y';
	const c = 'z';
	function f() { return 1; }
	export let p = a || (b === 'x');
</script>
<p>{p}</p>
