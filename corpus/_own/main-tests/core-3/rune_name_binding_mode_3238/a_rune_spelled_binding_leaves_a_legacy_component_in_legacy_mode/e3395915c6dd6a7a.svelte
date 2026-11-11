<script>
	export let p = 1;
	let n = 0;
	$: doubled = n * 2;
	function f() { for (const $state of []) { void $state; } }
</script>
<div>{p} {doubled}</div>
