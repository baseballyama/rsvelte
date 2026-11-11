<script>
	export let p = 1;
	let n = 0;
	$: doubled = n * 2;
	function f(x) { switch (x) { case 1: { const $props = 1; return $props; } } }
</script>
<div>{p} {doubled}</div>
