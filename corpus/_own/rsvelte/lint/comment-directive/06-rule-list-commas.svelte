<script>
	let html = $state('<b>x</b>');
	void 0;
</script>
<!-- eslint-disable svelte/no-at-html-tags , svelte/no-navigation-without-base -->
{@html html}
<a href="/suppressed-too">x</a>
<!-- eslint-enable svelte/no-at-html-tags,svelte/no-navigation-without-base -->
{@html html}
<a href="/reported-again">y</a>
