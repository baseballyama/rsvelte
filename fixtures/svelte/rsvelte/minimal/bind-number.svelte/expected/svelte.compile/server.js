import * as $ from 'svelte/internal/server';

export default function Bind_number($$renderer) {
	let a = 1;
	let b = 2;
	let sum = $.derived(() => a + b);

	$$renderer.push(`<input type="number"${$.attr('value', a)}/> <input type="range" min="0" max="10"${$.attr('value', b)}/> <p>${$.escape(a)} + ${$.escape(b)} = ${$.escape(sum())}</p>`);
}