import * as $ from 'svelte/internal/server';

export default function Row($$renderer, $$props) {
	let { children = undefined } = $$props;

	$$renderer.push(`<tr>`);

	if (children) {
		$$renderer.push('<!--[0-->');
		children($$renderer);
		$$renderer.push(`<!---->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></tr>`);
}