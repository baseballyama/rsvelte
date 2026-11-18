<script>
	export let p = 1;
	let n = 0;
	$: doubled = n * 2;
	function f() { class $bindable {} return new $bindable(); }
</script>
<div>{p} {doubled}</div>
