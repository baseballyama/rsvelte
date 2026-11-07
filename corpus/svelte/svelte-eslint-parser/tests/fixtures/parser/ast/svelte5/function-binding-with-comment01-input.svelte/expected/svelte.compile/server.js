import * as $ from 'svelte/internal/server';

export default function Function_binding_with_comment01_input($$renderer) {
	$$renderer.push(`<input${$.attr('value', x())}/>`);
}