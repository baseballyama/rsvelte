<div class="box">
	<p class="serif">x</p>
</div>

<style>
	@font-face {
		font-family: 'Custom';
		src: url('/f.woff2') format('woff2');
		font-display: swap;
	}

	@property --angle {
		syntax: '<angle>';
		initial-value: 0deg;
		inherits: false;
	}

	@charset "UTF-8";

	.box {
		--pad: var(--outer, var(--inner, 4px));
		padding: var(--pad) !important;
		rotate: var(--angle);
	}

	.serif {
		font-family: 'Custom', ui-serif, system-ui, sans-serif;
		font-size: clamp(1rem, 2.5vw + 0.5rem, 2rem);
		width: min(100%, calc(50ch - 2 * var(--pad)));
		aspect-ratio: 16 / 9;
	}
</style>
