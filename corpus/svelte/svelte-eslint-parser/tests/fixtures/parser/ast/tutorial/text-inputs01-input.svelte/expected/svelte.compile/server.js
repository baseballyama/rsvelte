import * as $ from 'svelte/internal/server';

export default function Text_inputs01_input($$renderer) {
	let name = 'world';

	$$renderer.push(`<input${$.attr('value', name)}/> <h1>Hello ${$.escape(name)}!</h1>`);
}