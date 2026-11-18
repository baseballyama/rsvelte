<script>
	let href = $state('/a');
</script>

<svg viewBox="0 0 10 10" preserveAspectRatio="xMidYMid meet">
	<a href={href} xml:lang="ja" aria-label="link">
		<text textLength="10" lengthAdjust="spacingAndGlyphs">t</text>
	</a>
	<feGaussianBlur stdDeviation="2" />
</svg>

<math display="block">
	<mi mathvariant="bold">x</mi>
</math>

<div data-double-dash--x="1" data-UPPER="2" aria-describedby="a b"></div>
<input formnovalidate autocapitalize="words" enterkeyhint="go" inputmode="numeric" />
<button popovertarget="p" popovertargetaction="toggle">pop</button>
<div id="p" popover="auto">pop body</div>
