import * as $ from 'svelte/internal/server';

export default function Write_less_code01_input($$renderer) {
	let a = 1;
	let b = 2;

	$$renderer.push(`<input type="number"${$.attr('value', a)}/> <input type="number"${$.attr('value', b)}/> <p>${$.escape(a)} + ${$.escape(b)} = ${$.escape(a + b)}</p>`);
}