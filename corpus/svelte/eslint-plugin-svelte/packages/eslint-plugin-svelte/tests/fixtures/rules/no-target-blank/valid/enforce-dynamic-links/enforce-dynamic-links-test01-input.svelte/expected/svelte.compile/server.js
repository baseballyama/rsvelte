import * as $ from 'svelte/internal/server';

export default function Enforce_dynamic_links_test01_input($$renderer) {
	let link = '';

	$$renderer.push(`<a${$.attr('href', link)} target="_blank">link</a>`);
}