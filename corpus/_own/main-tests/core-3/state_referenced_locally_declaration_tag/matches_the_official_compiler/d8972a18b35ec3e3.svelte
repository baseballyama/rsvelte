<script>
	let s = $state(0);
	let { p, q = 1 } = $props();
</script>
{let a = $state(0), b = a, c = $state(a), d = $state([a])}{b}{c}{d}