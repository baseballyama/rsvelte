<script>
	import{derived}from"svelte/store";

	let a = $state(1);
	let b = $derived(a * 2);
</script>

<p>{b}</p>
