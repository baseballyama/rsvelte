import * as $ from 'svelte/internal/server';

export default function Bind_on_test01_input($$renderer) {
	/* eslint no-console: 0 -- test */
	let value = 'Hello World';

	$$renderer.push(`<input${$.attr('value', value)}/> <input${$.attr('value', value)}/> <input${$.attr('value', value)}/>`);
}