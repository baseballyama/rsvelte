<script>
	/* An invalid regex entry (e.g. "/[unclosed/") is omitted: the oracle compiles
	   ignoreProperties eagerly and throws "Error while loading rule". */
	/* eslint svelte/no-unknown-style-directive-property: ["warn", { ignoreProperties: ["/^my-/i", "exact-one", "/x$/", "/a/gimsuy"] }] */
</script>

<div style:my-thing="1">a</div>
<div style:MY-THING="1">b</div>
<div style:exact-one="1">c</div>
<div style:exact-one-more="1">d</div>
<div style:other-thing="1">e</div>
<div style:box-x="1">f</div>
<div style:a-thing="1">g</div>
