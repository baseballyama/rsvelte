import * as $ from 'svelte/internal/server';

export default function _page($$renderer, $$props) {
	function load() {}

	$.bind_props($$props, { load });
}