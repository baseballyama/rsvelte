<script>
	let href = $state('#a');
	let label = $state('l');
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">
	<a xlink:href={href} aria-label={label}>
		<text x="1" y="1" font-size="2">{label}</text>
	</a>
	<foreignObject width="10" height="10">
		<div xmlns="http://www.w3.org/1999/xhtml">{label}</div>
	</foreignObject>
</svg>

<math xmlns="http://www.w3.org/1998/Math/MathML">
	<mrow><mi>{label}</mi></mrow>
</math>
