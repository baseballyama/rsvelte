import * as $ from 'svelte/internal/server';

export default function Colgroup($$renderer, $$props) {
	let { children = undefined } = $$props;

	$$renderer.push(`<colgroup>`);

	if (children) {
		$$renderer.push('<!--[0-->');
		children($$renderer);
		$$renderer.push(`<!---->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></colgroup>`);
}