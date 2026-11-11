<script>
	/* eslint svelte/html-closing-bracket-new-line: ["warn", { "multiline": "never", "singleline": "always" }] */
	let ok = true;
</script>

<div
	id="a"
	class="b"
>
	multiline break now flagged
</div>

<span data-ok={ok}>singleline without break now flagged</span>
