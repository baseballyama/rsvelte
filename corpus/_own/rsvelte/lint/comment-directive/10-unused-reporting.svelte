<script>
	/* eslint svelte/comment-directive: ["warn", { "reportUnusedDisableDirectives": true }] */
	let html = $state('<b>x</b>');
	void 0;
</script>
<!-- eslint-disable svelte/no-at-html-tags -->
<p>nothing suppressed here</p>
<!-- eslint-enable svelte/no-at-html-tags -->
<!-- eslint-disable svelte/no-at-html-tags -->
{@html html}
<!-- eslint-enable svelte/no-at-html-tags -->
