import * as $ from 'svelte/internal/server';

export default function _2_input($$renderer) {
	if (answer === 42) {
		$$renderer.push(`<!--[0--><p>what was the question?</p>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}