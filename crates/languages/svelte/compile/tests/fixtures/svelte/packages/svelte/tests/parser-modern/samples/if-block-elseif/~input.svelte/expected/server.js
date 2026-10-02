import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	if (x > 10) {
		$$renderer.push(`<!--[0--><p>x is greater than 10</p>`);
	} else if (x < 5) {
		$$renderer.push(`<!--[1--><p>x is less than 5</p>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}