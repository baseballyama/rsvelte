import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let value = void 0;

	$$renderer.push(`<input type="text"${$.attr('value', value)}/> <button id="setString"></button> <button id="setNull"></button> <button id="setUndefined"></button>`);
}