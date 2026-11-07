import * as $ from 'svelte/internal/server';

export default function _2_input($$renderer) {
	if (visible) {
		$$renderer.push(`<!--[0--><div>fades in and out</div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}