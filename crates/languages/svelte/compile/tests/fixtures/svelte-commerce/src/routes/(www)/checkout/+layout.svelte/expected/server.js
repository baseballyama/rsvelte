import * as $ from 'svelte/internal/server';

export default function _layout($$renderer, $$props) {
	let { children } = $$props;

	$.head('kr1aaj', $$renderer, ($$renderer) => {
		$$renderer.push(`<meta name="robots" content="noindex, nofollow"/>`);
	});

	children?.($$renderer);
	$$renderer.push(`<!---->`);
}