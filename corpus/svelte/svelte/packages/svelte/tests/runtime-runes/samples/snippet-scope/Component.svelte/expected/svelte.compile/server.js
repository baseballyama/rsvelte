import * as $ from 'svelte/internal/server';

export default function Component($$renderer, $$props) {
	let { inner } = $$props;

	if (inner) {
		$$renderer.push('<!--[0-->');
		inner($$renderer);
		$$renderer.push(`<!---->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}