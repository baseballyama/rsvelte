import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	if (2 > 1) {
		$$renderer.push(`<!--[0--><p>two is greater than one</p>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}