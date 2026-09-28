import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let a = [['Hello', 'World'], ['Sapper', 'App']];

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(a);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let a = each_array[$$index];

		$$renderer.push(`<div>${$.escape(a[0])} ${$.escape(a[1])} <input${$.attr('value', a[0])}/> <input${$.attr('value', a[1])}/></div>`);
	}

	$$renderer.push(`<!--]-->`);
}