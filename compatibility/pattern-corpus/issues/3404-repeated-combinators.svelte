<div class="card"><p class="a">x</p></div>

<style>
	.card >> .a {
		color: green;
	}

	.card >>> .a {
		color: blue;
	}

	.card {
		>> .a {
			color: teal;
		}
	}

	.card > .a {
		color: black;
	}
</style>
