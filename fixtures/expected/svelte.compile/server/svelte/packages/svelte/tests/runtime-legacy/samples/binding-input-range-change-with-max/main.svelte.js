import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let value = 10;
	let max = 10;

	function change() {
		value = 20;
		max = 20;
	}

	$$renderer.push(`<button></button> <input type="range" min="0"${$.attr('max', max)}${$.attr('value', value)}/> <p>${$.escape(value)} of ${$.escape(max)}</p>`);
}