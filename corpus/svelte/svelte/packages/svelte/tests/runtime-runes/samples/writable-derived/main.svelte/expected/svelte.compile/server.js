import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let count = 0;
	let double = $.derived(() => count * 2);

	$$renderer.push(`<input type="range"${$.attr('value', count)}/> <input type="range"${$.attr('value', double())}/> <p>${$.escape(count)} * 2 = ${$.escape(double())}</p>`);
}