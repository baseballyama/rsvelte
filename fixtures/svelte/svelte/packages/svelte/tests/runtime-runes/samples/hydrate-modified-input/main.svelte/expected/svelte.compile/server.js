import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let value = '';

	$$renderer.push(`<input type="text"${$.attr('value', value)}/> ${$.escape(value)}`);
}