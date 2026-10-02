import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let object = { value: 'hello' };

	$$renderer.push(`<input${$.attr('value', object.value)}/> <p>${$.escape(object.value)}</p>`);
}