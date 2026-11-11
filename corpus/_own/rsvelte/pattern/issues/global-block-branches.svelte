<b class="x">y</b>

<style>
	.x :global {
		.a {
			animation: kf 1s;

			& :global(i) {
				color: green;
			}
		}

		.b[data-t=":global(z)"] :global(i) {
			color: red;
		}

		.c {
			&:disabled {
			}
		}

		@keyframes kf {
			from {
				opacity: 0;
			}
		}
	}

	:global {
		.d {
			& :global(i) {
				color: blue;
			}
		}
	}
</style>
