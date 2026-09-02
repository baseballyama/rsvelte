<b class="x">y</b>

<style>
	:global {
		.a {
			&:disabled {
			}
		}

		.b {
			height: 20px;

			&:disabled {
			}
		}

		.c {
			animation: -global-kf 1s;

			& :global(i) {
				color: green;
			}
		}

		@keyframes -global-kf {
			from {
				opacity: 0;
			}
		}
	}

	.x :global {
		.d {
			&:disabled {
			}
		}
	}
</style>
