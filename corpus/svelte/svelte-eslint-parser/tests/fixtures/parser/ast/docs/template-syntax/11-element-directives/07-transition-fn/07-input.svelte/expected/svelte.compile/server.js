import * as $ from 'svelte/internal/server';

export default function _7_input($$renderer) {
	if (x) {
		$$renderer.push('<!--[0-->');

		if (y) {
			$$renderer.push(`<!--[0--><p>fades in and out when x or y change</p> <p>fades in and out only when y changes</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}