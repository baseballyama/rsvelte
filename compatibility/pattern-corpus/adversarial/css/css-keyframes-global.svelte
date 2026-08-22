<script>
	let spinning = $state(true);
</script>

<div class:spin={spinning} class="pulse">x</div>

<style>
	@keyframes -global-shared-fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes turn {
		to {
			transform: rotate(360deg);
		}
	}

	.spin {
		animation: turn 1s linear infinite, -global-shared-fade 2s;
	}

	.pulse {
		animation-name: turn;
		animation-duration: 0.5s;
	}
</style>
