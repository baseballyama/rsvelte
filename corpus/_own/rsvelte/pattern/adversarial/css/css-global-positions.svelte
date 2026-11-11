<div class="wrap">
	<p class="inner">x</p>
</div>

<style>
	:global(.themed) .wrap {
		color: red;
	}

	.wrap :global(.injected) {
		color: blue;
	}

	:global(.x):hover {
		color: green;
	}

	:global {
		.anything {
			margin: 0;

			.nested-global {
				padding: 0;
			}
		}
	}

	.wrap:has(:global(.injected)) {
		border: 1px solid;
	}
</style>
