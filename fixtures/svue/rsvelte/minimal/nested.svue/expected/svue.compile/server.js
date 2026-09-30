import * as $ from 'svelte/internal/server';

export default function Nested_svue($$renderer) {
	let a = true;
	let b = false;
	let n = 0;

	if (a) {
		$$renderer.push(`<!--[0--><p>A</p>`);
	} else {
		$$renderer.push(`<!--[-1--><div>`);

		if (b) {
			$$renderer.push(`<!--[0--><span>B 0</span>`);
		} else if (n > 1) {
			$$renderer.push(`<!--[1--><span>many</span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	}

	$$renderer.push(`<!--]-->0`);

	if (n === 0) {
		$$renderer.push(`<!--[0--><em>zero</em>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> <strong>tail</strong>`);
}