import * as $ from 'svelte/internal/server';

export default function Bind_value($$renderer) {
	let name = 'world';
	$$renderer.push(`<input${$.attr('value', name)}/> <p>Hello ${$.escape(name)}!</p>`);
}
