<div class="anim">x</div>
<div class="global-anim">y</div>

<style>
	@keyframes spin {
		from {
			transform: rotate(0);
		}
		to {
			transform: rotate(1turn);
		}
	}

	@-webkit-keyframes legacy {
		0%,
		100% {
			opacity: 1;
		}
	}

	@keyframes -global-shared {
		from {
			opacity: 0;
		}
	}

	.anim {
		animation: spin 1s linear infinite, legacy 2s;
	}

	.global-anim {
		animation-name: shared;
	}
</style>
