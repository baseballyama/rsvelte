import * as $ from 'svelte/internal/server';

export default function IconifyIcon($$renderer, $$props) {
	const { collection, name, $$slots, $$events, ...rest } = $$props;

	// eslint-disable-next-line no-unused-expressions
	rest;

	$$renderer.push(`<div${$.attr_class(`i-${$.stringify(collection)}-${$.stringify(name)}`)}></div>`);
}