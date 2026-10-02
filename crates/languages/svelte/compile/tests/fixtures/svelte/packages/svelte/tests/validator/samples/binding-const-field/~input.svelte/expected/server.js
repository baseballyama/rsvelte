import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	const dummy = { foo: 'bar' };

	$$renderer.push(`<input${$.attr('value', dummy.foo)}/>`);
}