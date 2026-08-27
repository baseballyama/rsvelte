<script>
	let { p } = $props();
	let s = $state(1);
</script>

<em>x{void p}</em>

{#if true}
	{@const known = void p}
	{@const unknown_not = !p}
	{@const unknown_neg = -s}
	<b>{known}</b>
	<i>{unknown_not}</i>
	<u>{unknown_neg}</u>
{/if}
