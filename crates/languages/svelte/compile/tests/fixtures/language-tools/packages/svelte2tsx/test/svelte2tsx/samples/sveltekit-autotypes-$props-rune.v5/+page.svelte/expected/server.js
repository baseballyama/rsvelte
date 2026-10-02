import * as $ from 'svelte/internal/server';

export default function _page($$renderer, $$props) {
	let { form, data, params } = $$props;
	const snapshot = {};

	$.bind_props($$props, { snapshot });
}