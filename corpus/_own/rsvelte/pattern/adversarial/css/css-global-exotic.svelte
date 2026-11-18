<script>
	let on = $state(true);
</script>

<div class="a"><span class="b">x</span></div>
{#if on}<p class="c">y</p>{/if}

<style>
	.a .b :global(.ext) {
		color: red;
	}
	:global(body) > .a {
		margin: 0;
	}
	.a:has(.b) {
		padding: 1px;
	}
	.c:is(.a, .b) {
		border: 0;
	}
	.unused:where(.a, .b) {
		outline: none;
	}
	@keyframes -global-spin {
		to {
			transform: rotate(360deg);
		}
	}
	.a {
		animation: spin 1s;
	}
</style>
