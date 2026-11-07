import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let a = [{ a: { b: 'Hello', c: 'World' }, key: 'b' }];

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(a);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let { a, key } = each_array[$$index];

		$$renderer.push(`<div>${$.escape(key)}: ${$.escape(a[key])} <input${$.attr('value', a[key])}/></div>`);
	}

	$$renderer.push(`<!--]--> <button>Button</button>`);
}