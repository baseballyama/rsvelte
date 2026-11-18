<script>
	let s = $state(0);
	let { p, q = 1 } = $props();
</script>
{let a = $state(0), b = $derived(a), c = { a: 1 }, e = c.a}{b}{e}