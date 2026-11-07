import * as $ from 'svelte/internal/server';

export default function _1_input($$renderer) {
	if (expression) {
		$$renderer.push(`<!--[0-->...`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	if (expression) {
		$$renderer.push(`<!--[0-->...`);
	} else if (expression) {
		$$renderer.push(`<!--[1-->...`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	if (expression) {
		$$renderer.push(`<!--[0-->...`);
	} else {
		$$renderer.push(`<!--[-1-->...`);
	}

	$$renderer.push(`<!--]-->`);
}