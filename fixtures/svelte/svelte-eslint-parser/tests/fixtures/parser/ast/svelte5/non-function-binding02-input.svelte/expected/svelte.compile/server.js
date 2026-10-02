import * as $ from 'svelte/internal/server';

export default function Non_function_binding02_input($$renderer) {
	$$renderer.push(`<input${$.attr('value', x())}/>`);
}