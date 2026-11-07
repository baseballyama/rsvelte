import * as $ from 'svelte/internal/server';

export default function Ignore_svelte_self01_input($$renderer) {
	let foo = Math.random();

	$$renderer.push(`<div>`);

	if (foo > 0.5) {
		$$renderer.push('<!--[0-->');
		Ignore_svelte_self01_input($$renderer, { style: 'display:block' });
		$$renderer.push(`<!---->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></div>`);
}