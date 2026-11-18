<div class="a">
	<section class="b"><span class="c">t</span></section>
</div>
<p class="d">u</p>

<style>
	.a || .b {
		color: red;
	}

	.a || .b > .c {
		color: green;
	}

	.a > .b || .c {
		color: blue;
	}

	.zz || .b {
		color: teal;
	}

	.b + .d || .c {
		color: olive;
	}

	.a || :global(.x) {
		color: navy;
	}

	.a > .b {
		color: black;
	}
</style>
