import * as $ from 'svelte/internal/server';

export default function Test02_input($$renderer) {
	$$renderer.push(`<div${$.attr_style(`color: ${$.stringify(red)}; width: 12px`)}>...</div>`);
}