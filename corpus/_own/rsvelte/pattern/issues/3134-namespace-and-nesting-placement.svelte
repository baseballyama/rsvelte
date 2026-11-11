<div class="a"><svg><circle class="a" /></svg></div>

<style>
	svg|circle {
		color: red;
	}

	*|div {
		color: blue;
	}

	.a svg|circle {
		color: green;
	}

	:global(&) {
		color: teal;
	}
</style>
