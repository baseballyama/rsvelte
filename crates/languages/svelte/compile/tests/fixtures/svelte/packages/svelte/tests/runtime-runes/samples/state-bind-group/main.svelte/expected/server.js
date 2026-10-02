import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let checkboxes = [];
	let values = ['1', '2', '3'];

	$$renderer.push(`<button>+</button> <!--[-->`);

	const each_array = $.ensure_array_like(values);

	for (let i = 0, $$length = each_array.length; i < $$length; i++) {
		let val = each_array[i];

		$$renderer.push(`<input type="checkbox"${$.attr('value', val)}${$.attr('checked', checkboxes.includes(val), true)}/>`);
	}

	$$renderer.push(`<!--]--> ${$.escape(JSON.stringify(checkboxes))}`);
}