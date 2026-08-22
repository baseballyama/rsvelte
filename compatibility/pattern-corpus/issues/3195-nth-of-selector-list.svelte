<ul>
	<li class="a">a</li>
	<li class="b">b</li>
	<li class="excluded">c</li>
</ul>

<style>
	/* the `of` argument is a selector LIST, so a comma and a combinator both
	   have to parse — with and without the whitespace after `of` */
	li:nth-child(2n of .a, .b) {
		color: red;
	}

	li:nth-child(2n of.a, .b) {
		color: green;
	}

	li:nth-last-child(-n + 3 of .a.b, :not(.excluded)) {
		color: blue;
	}

	li:nth-child(2n of *) {
		font-weight: bold;
	}
</style>
