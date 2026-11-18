<script>
	export let a;
	const s = '{@debug a}';
	// {@debug comment}
</script>

<!-- {@debug html} -->
{'{@debug text}'}
<span data-v={s}>{s}</span>
{@debug a}
