<svg class="p q"><path class="a"><i class="b"><u class="c"></u></i></path></svg>

<style>
	.p :global {
		&.a { opacity: 1; }
		& { color: red; }
		.a { color: blue; }
		& .b { color: green; }
		:global(.c) { color: gray; }
	}

	.p {
		:global.q {
			&.a { opacity: 1; }
			.b { color: teal; }
		}
	}

	.p {
		& .a { opacity: 0; }
	}
</style>
