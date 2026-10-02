import * as $ from 'svelte/internal/server';

export default function Radio_bind_group($$renderer) {
	let selection = 'cat';

	$$renderer.push(`<input type="radio" value="cat"${$.attr('checked', selection === 'cat', true)}/> <input type="radio" value="dog"${$.attr('checked', selection === 'dog', true)}/> <input type="radio" value="fish"${$.attr('checked', selection === 'fish', true)}/> ${$.escape(selection)}`);
}