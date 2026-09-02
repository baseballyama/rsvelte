<!--
	The template carries no element on purpose: a `&` under a fully-global parent
	matches every element, so one stray tag makes every nested `:global(i)` used and
	the whole shape stops discriminating.
-->
<script>
	import Child from './Child.svelte';
</script>

<Child />

<style>
	:global(.args) {
		width: 20px;

		&:disabled {
			& :global(i) {
				color: green;
			}
		}

		&:hover {
			color: red;

			& :global(i) {
				color: blue;
			}
		}
	}

	:global {
		.bare {
			height: 20px;

			&:disabled {
				& span {
					color: green;
				}
			}
		}
	}

	.local {
		top: 0;

		&:disabled {
			& span {
				color: green;
			}
		}
	}
</style>
