import * as $ from 'svelte/internal/server';
import favicon from '$lib/assets/favicon.ico';
import './layout.css';

export default function _layout($$renderer, $$props) {
	const { children } = $$props;

	$.head('vlp6n1', $$renderer, ($$renderer) => {
		$$renderer.push(`<link rel="icon"${$.attr('href', favicon)}/>`);
	});

	children($$renderer);
	$$renderer.push(`<!---->`);
}