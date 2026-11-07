import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<svg xmlns:xlink="foo"></svg> <a xlink:href="foo"></a>`);
}