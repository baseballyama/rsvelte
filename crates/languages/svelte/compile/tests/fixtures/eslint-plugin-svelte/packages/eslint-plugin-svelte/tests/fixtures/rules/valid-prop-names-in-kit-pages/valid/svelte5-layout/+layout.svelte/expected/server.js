import * as $ from 'svelte/internal/server';

export default function _layout($$renderer, $$props) {
	let { data, children } = $$props;

	children($$renderer);
	$$renderer.push(`<!---->`);
}