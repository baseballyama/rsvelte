<div class="a" data-k="v">x</div>

<style>
	[ data-k ] {
		color: red;
	}

	[data-k~='v'] {
		color: green;
	}

	[data-k|='v'] {
		color: blue;
	}

	[data-k='v' i] {
		color: teal;
	}

	.a,
	[data-k] {
		color: black;
	}
</style>
