import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let text = 'A';

	$$renderer.push(`<input${$.attr('value', (() => text)())}/> <p>${$.escape(text)}</p>`);
}