import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	if (true) {
		$$renderer.push(`<!--[0--><input/>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	if (true) {
		$$renderer.push(`<!--[0--><br/>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	$.await(
		$$renderer,
		true,
		() => {
			$$renderer.push(`<input/>`);
		},
		(f) => {}
	);

	$$renderer.push(`<!--]--> `);

	$.await(
		$$renderer,
		true,
		() => {
			$$renderer.push(`<br/>`);
		},
		(f) => {}
	);

	$$renderer.push(`<!--]-->`);
}