import * as $ from 'svelte/internal/server';

export default function ComponentA($$renderer, $$props) {
	const a = {};

	$$renderer.push(`<div>a</div>`);
	$.bind_props($$props, { a });
}