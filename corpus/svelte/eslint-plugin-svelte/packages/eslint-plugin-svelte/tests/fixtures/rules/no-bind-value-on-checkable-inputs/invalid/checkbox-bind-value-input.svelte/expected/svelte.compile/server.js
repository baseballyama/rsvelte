import * as $ from 'svelte/internal/server';

export default function Checkbox_bind_value_input($$renderer) {
	let check1 = true;
	let check2 = true;
	let check3 = true;
	let check4 = true;
	let value = true;

	$$renderer.push(`<input type="checkbox"${$.attr('value', value)}/> <input type="checkbox"${$.attr('value', check1)}/> <input type="CHECKBOX"${$.attr('value', check2)}/> <input type="checkbox"${$.attr('value', check3)}/> <input type="CHECKBOX"${$.attr('value', check4)}/> <input type="checkbox"${$.attr('value', value)}/>`);
}