import * as $ from 'svelte/internal/server';

export default function _6_input($$renderer) {
	if (visible) {
		$$renderer.push(`<!--[0--><p>Flies in and out</p>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}