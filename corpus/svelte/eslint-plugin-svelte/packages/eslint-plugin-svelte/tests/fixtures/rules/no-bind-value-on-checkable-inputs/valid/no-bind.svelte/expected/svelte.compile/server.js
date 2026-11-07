import * as $ from 'svelte/internal/server';

export default function No_bind($$renderer) {
	let strange = void 0;

	$$renderer.push(`<input type="checkbox"${$.attr('value', strange)}/>`);
}