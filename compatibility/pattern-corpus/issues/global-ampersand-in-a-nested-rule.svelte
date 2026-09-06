<svg class="p q"><path class="a"><i class="b"><u class="c"></u></i></path></svg>

<style>
	.p {
		:global .a { opacity: 1; }
		:global.a { color: red; }
		:global > .a { color: blue; }
		.b :global .a { color: green; }
		:global(.a) { color: gray; }
	}

	.p :global {
		:global .a { opacity: 0.9; }
		:global.a { color: teal; }
		:global > .a { color: olive; }
	}

	:global {
		:global .a { opacity: 0.8; }
		:global.a { color: navy; }
		:global > .a { color: maroon; }
	}

	:global .a { color: purple; }
	:global(.a) { color: brown; }
</style>
