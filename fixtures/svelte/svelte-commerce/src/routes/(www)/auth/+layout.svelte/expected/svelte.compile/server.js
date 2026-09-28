import * as $ from 'svelte/internal/server';

export default function _layout($$renderer, $$props) {
	let { children } = $$props;

	$.head('1mhbkox', $$renderer, ($$renderer) => {
		$$renderer.push(`<meta name="robots" content="noindex, nofollow"/>`);
	});

	children?.($$renderer);
	$$renderer.push(`<!---->`);
}