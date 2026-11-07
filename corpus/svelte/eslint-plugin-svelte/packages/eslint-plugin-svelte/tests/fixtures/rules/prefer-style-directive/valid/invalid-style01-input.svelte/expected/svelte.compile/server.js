import * as $ from 'svelte/internal/server';

export default function Invalid_style01_input($$renderer) {
	let style = "color: red";

	$$renderer.push(`<div${$.attr_style(style)}>...</div> <div${$.attr_style(style)}>...</div>`);
}