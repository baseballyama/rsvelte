import * as $ from 'svelte/internal/server';

export default function _page($$renderer, $$props) {
	/** @type {{form: boolean, data: true }} */
	let { form, data } = $$props;

	/** @type {any} */
	const snapshot = {};

	$.bind_props($$props, { snapshot });
}