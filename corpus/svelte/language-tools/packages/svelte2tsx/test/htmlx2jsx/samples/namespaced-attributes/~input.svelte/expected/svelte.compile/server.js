import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<use${$.attr('xlink:href', test)}></use>`);
}