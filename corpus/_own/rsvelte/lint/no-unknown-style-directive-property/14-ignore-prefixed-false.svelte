<script>
	/* eslint svelte/no-unknown-style-directive-property: ["warn", { ignorePrefixed: false }] */
</script>

<div style:-webkit-transform="none">a</div>
<div style:-moz-bogus="none">b</div>
<div style:--custom="none">c</div>
<div style:color="red">d</div>
<div style:-webkit-="1">e</div>
