import * as $ from 'svelte/internal/server';

export default function If_block01_input($$renderer) {
	if (expression) {
		$$renderer.push('<!--[0-->');
	} else if (expression) {
		$$renderer.push('<!--[1-->');
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}