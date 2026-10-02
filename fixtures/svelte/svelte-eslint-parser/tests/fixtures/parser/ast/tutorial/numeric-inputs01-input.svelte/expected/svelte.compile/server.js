import * as $ from 'svelte/internal/server';

export default function Numeric_inputs01_input($$renderer) {
	let a = 1;
	let b = 2;

	$$renderer.push(`<label><input type="number"${$.attr('value', a)} min="0" max="10"/> <input type="range"${$.attr('value', a)} min="0" max="10"/></label> <label><input type="number"${$.attr('value', b)} min="0" max="10"/> <input type="range"${$.attr('value', b)} min="0" max="10"/></label> <p>1 + 2 = 3</p>`);
}