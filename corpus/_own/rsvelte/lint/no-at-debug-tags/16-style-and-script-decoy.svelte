<script>
	const re = /\{@debug a\}/u;
	const tpl = `{@debug a}`;
	/* {@debug a} */
	// {@debug a}
	export let a = re.source.length + tpl.length;
</script>

<!-- {@debug a} -->
<span title="&#123;@debug a&#125;">{'{@debug a}'}</span>

<style>
	/* {@debug a} */
	span::after {
		content: '{@debug a}';
	}
</style>
