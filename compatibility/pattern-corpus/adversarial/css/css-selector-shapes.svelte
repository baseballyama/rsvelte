<div class="a b">
	<span class="c">x</span>
	<p>y</p>
</div>

<style>
	.a:is(.b, .z) .c {
		color: red;
	}
	.a:where(.b) > p:nth-child(1 of p) {
		color: blue;
	}
	:global(.outer) .a {
		color: green;
	}
	.a:has(> .c) {
		outline: 1px solid;
	}
	p::first-line {
		font-weight: bold;
	}
	@supports selector(:has(*)) {
		.a:has(.c) {
			color: teal;
		}
	}
	@media (min-width: 1px) and (prefers-reduced-motion: no-preference) {
		.a .c {
			color: gold;
		}
	}
	.a {
		&:hover .c {
			color: pink;
		}
		& > p {
			color: olive;
		}
	}
</style>
