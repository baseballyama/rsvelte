<script>
	/* eslint svelte/first-attribute-linebreak: ["warn", { "singleline": "below", "multiline": "beside" }] */
	let v = 1;
</script>

<div class="a" id="b">singleline beside now flagged</div>
<div
	class="a"
	id="b"
>
	multiline below now flagged
</div>
<div title={v}
	id="b">multiline beside now ok</div>
