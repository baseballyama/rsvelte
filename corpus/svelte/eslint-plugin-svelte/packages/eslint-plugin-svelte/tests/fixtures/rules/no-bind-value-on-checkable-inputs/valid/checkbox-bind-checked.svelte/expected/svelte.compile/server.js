import * as $ from 'svelte/internal/server';

export default function Checkbox_bind_checked($$renderer) {
	let checked = true;

	$$renderer.push(`<input type="checkbox" value="irrelevant"${$.attr('checked', checked, true)}/> ${$.escape(checked)}`);
}