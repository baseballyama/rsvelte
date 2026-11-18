<div class="a"><b class="b">x</b></div>

<style>
	/* before the first rule */
	.a /* after the selector */ {
		/* first in the block */
		color: /* before the value */ red /* after the value */;
		/* between declarations */
		background: blue;
		/* last in the block */
	}

	.a /* before the comma */, .b /* before the brace */ {
		color: green;
	}

	.a, /* after the comma */ .b {
		color: purple;
	}

	@media /* in the prelude */ (min-width: 1px) {
		/* inside the at-rule block */
		.a {
			color: teal;
		}
	}

	.a {
		/* before a nested rule */
		& .b {
			color: olive;
		}
	}
	/* after the last rule */
</style>
