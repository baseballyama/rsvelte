<div class="card wide">
	<p class="a">x</p>
	<span class="b">y</span>
</div>

<style>
	/* An argument made only of `:global(...)` truncates to nothing, which
	   upstream reads as "matches anything" — every element is scoped. The
	   emitted CSS is byte-identical either way, so only the class on the
	   elements separates the two. */
	:where(:global(.x)) {
		color: red;
	}

	:is(:global(.x)) {
		color: green;
	}

	:is(:global(.x), .a) {
		color: blue;
	}

	/* A descendant inside `:is()` cannot be checked by the element walk, so
	   upstream assumes it matches rather than pruning. */
	:is(.card .a) {
		color: teal;
	}

	:is(.a :global(.x)) {
		color: olive;
	}

	/* Controls: `:global()` outside a functional pseudo-class, and a
	   functional pseudo-class with no `:global()` — both already agreed. */
	:global(.x) .a {
		color: purple;
	}

	:is(.a, .b) {
		color: maroon;
	}
</style>
