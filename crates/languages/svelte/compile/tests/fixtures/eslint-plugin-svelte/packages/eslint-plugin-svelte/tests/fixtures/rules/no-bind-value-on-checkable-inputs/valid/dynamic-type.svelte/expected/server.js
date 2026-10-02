import * as $ from 'svelte/internal/server';

export default function Dynamic_type($$renderer) {
	let isChecked = false;
	let type = 'checkbox';

	$$renderer.push(`<input${$.attr('type', type)}${$.attr('value', isChecked)}/>`);
}