import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let name = 'world';
	let current = '';

	$$renderer.push(`<input type="radio" name="current"${$.attr('checked', current === name, true)}${$.attr('value', name)}/> <input type="text"${$.attr('value', current)}/> <input type="text"${$.attr('value', name)}/>`);
}