import * as $ from 'svelte/internal/server';

export default function _page($$renderer, $$props) {
	const load = () => {};

	$.bind_props($$props, { load });
}