<div class="outer inner media supports container kf">x</div>

<style>
	.outer {
		color: red;

		& .inner {
			color: blue;
		}
	}
	@media (min-width: 1px) {
		.media {
			color: red;
		}
	}
	@supports (display: grid) {
		.supports {
			color: red;
		}
	}
	@container (min-width: 1px) {
		.container {
			color: red;
		}
	}
	@keyframes kf {
		from {
			opacity: 0;
		}
	}
</style>
