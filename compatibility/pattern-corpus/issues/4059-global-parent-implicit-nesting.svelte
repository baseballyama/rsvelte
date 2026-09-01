<svg class="wrapper"><path class="icon-active"><i class="dot"></i></path></svg>
<b class="plain">x</b>

<style>
	:global(.trakt-link-active),
	:global(button:active) {
		.icon-active {
			opacity: 1;
		}
	}

	:global(.x) {
		.icon-active {
			.dot {
				opacity: 0;
			}
		}
	}

	:global(.y) .wrapper {
		.icon-active {
			opacity: 0.5;
		}
	}

	.plain {
		opacity: 1;
	}
</style>
