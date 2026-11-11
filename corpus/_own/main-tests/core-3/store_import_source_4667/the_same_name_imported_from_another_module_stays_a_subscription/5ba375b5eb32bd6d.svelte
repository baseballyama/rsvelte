<script>
	import{derived}from"./m.js";
	let a = $state(1);
	let b = $derived(a * 2);
</script>

<p>{b}</p>
