<div class="a">x</div>

<style>
	/* `print()` used to re-emit this whole block from the source text whenever
	   it carried no CSS comment, so nothing below reached the CSS visitors.
	   Every construct here is one the visitors have to render themselves. */
	@namespace svg url(http://www.w3.org/2000/svg);

	svg|circle,
	*|circle,
	svg|*,
	*|* {
		fill: red;
	}

	#\31\32\33 {
		color: green;
	}

	#line\a break {
		color: green;
	}

	.a\5c b {
		color: red;
	}

	@font-face {
		font-family: "MyFont";
		src: url("/fonts/MyFont.woff2") format("woff2");
	}
</style>
