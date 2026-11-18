<div class="x">y</div>

<style>
	:global(svg|a) {
		color: green;
	}

	:global(*|a) {
		color: red;
	}

	:global(.x:is(.y, [data-z='a,b'])) {
		color: blue;
	}

	.x {
		animation-name: shared;
	}

	@keyframes -global-shared {
		from {
			opacity: 0;
		}
	}
</style>
