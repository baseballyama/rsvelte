<div class="q">quoted</div>

<style>
	.q::before {
		content: '}';
	}

	.q::after {
		content: '{#if x} " \' \3C b>';
	}

	/* comment containing } and { and "quote */
	.q:hover::before {
		content: 'a\'b';
		background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"></svg>');
	}
</style>
