import * as $ from 'svelte/internal/server';

export default function Text_inputs02_input($$renderer) {
	let name = 'world';

	$$renderer.push(`<input${$.attr('value', name)}/> <h1>Hello world!</h1>`);
}