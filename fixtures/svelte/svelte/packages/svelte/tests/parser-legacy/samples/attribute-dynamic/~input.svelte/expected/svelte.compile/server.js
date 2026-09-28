import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<div${$.attr_style(`color: ${$.stringify(color)};`)}>${$.escape(color)}</div>`);
}