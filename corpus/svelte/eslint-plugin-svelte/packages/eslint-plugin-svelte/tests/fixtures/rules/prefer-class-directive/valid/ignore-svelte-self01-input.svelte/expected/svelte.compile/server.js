import * as $ from 'svelte/internal/server';

export default function Ignore_svelte_self01_input($$renderer) {
	let foo = Math.random();
	let current = 'foo';

	$$renderer.push(`<div>`);

	if (foo > 0.5) {
		$$renderer.push('<!--[0-->');
		Ignore_svelte_self01_input($$renderer, { class: current === 'foo' ? 'selected' : '' });
		$$renderer.push(`<!---->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></div>`);
}