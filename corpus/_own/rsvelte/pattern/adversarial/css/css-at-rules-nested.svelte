<div class="card">
	<p class="note">hi</p>
</div>

<style>
	@layer base, components;

	@layer components {
		.card {
			container-type: inline-size;
			container-name: card;
		}
	}

	@media (min-width: 600px) and (prefers-color-scheme: dark) {
		@supports (display: grid) and (not (display: inline-grid)) {
			.card {
				display: grid;
			}
		}
	}

	@container card (inline-size > 300px) {
		.note {
			font-size: 1.2em;
		}
	}

	.card {
		.note {
			color: gray;

			&:hover {
				color: black;
			}
		}
	}
</style>
