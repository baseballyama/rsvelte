import * as $ from 'svelte/internal/server';

export default function _page($$renderer, $$props) {
	const snapshot = {};
	let { form, data } = $$props;

	$.bind_props($$props, { snapshot });
}