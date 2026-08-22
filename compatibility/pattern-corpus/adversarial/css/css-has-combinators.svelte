<section class="s">
	<h2 class="t">t</h2>
	<p class="p">p</p>
	<span class="x">x</span>
</section>

<style>
	.s:has(> .t) {
		color: red;
	}

	.t:has(+ .p) {
		color: blue;
	}

	.t:has(~ .x) {
		color: green;
	}

	.s:has(.p, .missing) {
		color: teal;
	}

	.s:not(:has(.nothing)) {
		color: olive;
	}

	.s:has(:is(.p, .t)):has(.x) {
		color: navy;
	}
</style>
