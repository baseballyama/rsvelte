<script>
	let label = $state('inside');
</script>

<svg viewBox="0 0 100 100">
	<defs>
		<linearGradient id="g1" gradientTransform="rotate(45)">
			<stop offset="0%" stop-color="red" />
		</linearGradient>
		<clipPath id="c1">
			<circle cx="50" cy="50" r="40" />
		</clipPath>
	</defs>
	<filter id="f1">
		<feColorMatrix type="saturate" values="0.5" />
		<feGaussianBlur stdDeviation="1" />
	</filter>
	<rect width="100" height="100" fill="url(#g1)" clip-path="url(#c1)" filter="url(#f1)" />
	<foreignObject x="10" y="10" width="80" height="80">
		<div class="html-inside">
			<button onclick={() => (label = label.toUpperCase())}>{label}</button>
			<svg width="10" height="10">
				<circle cx="5" cy="5" r="4" />
			</svg>
		</div>
	</foreignObject>
	<use href="#c1" />
	<text>
		<textPath href="#c1">curve</textPath>
	</text>
</svg>

<style>
	.html-inside {
		font-size: 10px;
	}
</style>
