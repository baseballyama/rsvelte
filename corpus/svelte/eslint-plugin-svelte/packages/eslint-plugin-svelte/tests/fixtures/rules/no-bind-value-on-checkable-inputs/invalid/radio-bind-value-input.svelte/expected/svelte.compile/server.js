import * as $ from 'svelte/internal/server';

export default function Radio_bind_value_input($$renderer) {
	let check1 = true;
	let check2 = true;
	let check3 = true;
	let check4 = true;
	let value = true;

	$$renderer.push(`<input type="radio"${$.attr('value', value)}/> <input type="radio"${$.attr('value', check1)}/> <input type="RADIO"${$.attr('value', check2)}/> <input type="radio"${$.attr('value', check3)}/> <input type="RADIO"${$.attr('value', check4)}/> <input type="radio"${$.attr('value', value)}/>`);
}