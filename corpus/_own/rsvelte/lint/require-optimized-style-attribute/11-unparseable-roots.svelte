<script>
	let x = 'red';
</script>

<!-- `style="@media"` (a params-less at-rule) is omitted: it crashes the oracle's
     no-dupe-style-properties on `node.source.end.offset` of undefined. -->
<div style="@media print">b</div>
<div style="@charset &quot;utf-8&quot;">a</div>
<div style="color: red; @supports (a: b)">c</div>
<div style="/* {x} */ color: red">d</div>
<div style="color: /* {x} */ red">e</div>
<div style="/* unterminated {x}">f</div>
