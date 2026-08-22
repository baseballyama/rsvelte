<script>
	let r = $state(5);
</script>

<svg viewBox="0 0 10 10">
	<circle cx="5" cy="5" {r} fill="red" />
	<foreignObject x="0" y="0" width="10" height="10">
		<p>html island</p>
	</foreignObject>
	<text dy=".3em">{r}</text>
</svg>
<math>
	<mrow><mi>x</mi><mo>=</mo><mn>{r}</mn></mrow>
</math>
