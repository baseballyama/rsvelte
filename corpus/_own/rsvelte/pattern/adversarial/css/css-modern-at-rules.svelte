<div class="card"><p class="body">x</p></div>

<style>
	@scope (.card) to (.body) {
		p {
			color: red;
		}
	}

	@starting-style {
		.card {
			opacity: 0;
		}
	}

	@container card (min-width: 1px) {
		.body {
			color: blue;
		}
	}

	@supports (color: color-mix(in srgb, red, blue)) and (display: grid) {
		.card {
			color: color-mix(in srgb, red, blue);
		}
	}

	@media (400px <= width <= 700px) {
		.card {
			color: green;
		}
	}

	@layer base, theme;

	@layer theme {
		.card {
			border: 0;
		}
	}
</style>
