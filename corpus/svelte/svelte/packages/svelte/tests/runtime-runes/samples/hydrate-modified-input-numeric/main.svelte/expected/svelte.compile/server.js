import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let value = 0;

	$$renderer.push(`<input type="number"${$.attr('value', value)}/> ${$.escape(value)} (${$.escape(typeof value)})`);
}