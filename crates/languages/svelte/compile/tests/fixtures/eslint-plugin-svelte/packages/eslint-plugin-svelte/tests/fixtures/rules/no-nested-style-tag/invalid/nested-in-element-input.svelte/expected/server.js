import * as $ from 'svelte/internal/server';

export default function Nested_in_element_input($$renderer) {
	$$renderer.push(`<div>`);
	$$renderer.push(`<style>p { color: red; }</style>`);
	$$renderer.push(`</div>`);
}