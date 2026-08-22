<script>
	const s = '{@html s}';
	// {@html comment}
	const t = `{@html ${'tpl'}}`;
</script>

<!-- {@html html} -->
{'{@html text}'}
<span data-x={s}>{t}</span>
{@html s}
