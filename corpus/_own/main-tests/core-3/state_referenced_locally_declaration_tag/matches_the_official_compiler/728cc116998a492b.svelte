<script>
	let s = $state(0);
	let { p, q = 1 } = $props();
</script>
{let a = $state(0)}{const b = a}{#if s}{const c = a}{c}{/if}{b}