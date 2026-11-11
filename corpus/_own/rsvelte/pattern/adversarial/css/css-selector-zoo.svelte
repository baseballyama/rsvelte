<div class="a" data-x="v" dir="rtl">
	<p class="b">1</p>
	<p class="c">2</p>
	<input placeholder="p" />
</div>

<style>
	.a > .b + .c {
		color: red;
	}

	.a [data-x='v' i] {
		color: blue;
	}

	.a:not(.b, .missing) {
		border: 0;
	}

	.b:nth-last-of-type(odd) {
		margin: 0;
	}

	.a:focus-within .b,
	.a .b:focus-visible {
		outline: none;
	}

	input::placeholder {
		opacity: 0.4;
	}

	.a::marker {
		content: '';
	}

	:dir(rtl) .b {
		text-align: right;
	}
</style>
