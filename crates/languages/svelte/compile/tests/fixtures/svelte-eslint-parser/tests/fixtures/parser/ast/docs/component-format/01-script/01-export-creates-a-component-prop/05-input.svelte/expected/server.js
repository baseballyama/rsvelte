import * as $ from 'svelte/internal/server';

export default function _5_input($$renderer, $$props) {
	let className;

	$.bind_props($$props, { class: className });
	// creates a `class` property, even
	// though it is a reserved word
}