import * as $ from 'svelte/internal/server';

export default function Else_if_blocks02_input($$renderer) {
	let x = 7;

	if (x > 10) {
		$$renderer.push(`<!--[0--><p>7 is greater than 10</p>`);
	} else if (5 > x) {
		$$renderer.push(`<!--[1--><p>7 is less than 5</p>`);
	} else {
		$$renderer.push(`<!--[-1--><p>7 is between 5 and 10</p>`);
	}

	$$renderer.push(`<!--]-->`);
}