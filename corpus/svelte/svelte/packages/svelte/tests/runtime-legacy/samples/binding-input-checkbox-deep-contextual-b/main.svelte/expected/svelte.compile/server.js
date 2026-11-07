import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	let todos = [
		{ done: false, text: 'one' },
		{ done: false, text: 'two' },
		{ done: false, text: 'three' }
	];

	function clear() {
		todos = todos.filter((t) => !t.done);
	}

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(todos);

	for (let i = 0, $$length = each_array.length; i < $$length; i++) {
		let todo = each_array[i];

		$$renderer.push(`<div><input type="checkbox"${$.attr('checked', todo.done, true)}/> <p>${$.escape(todo.text)}</p></div>`);
	}

	$$renderer.push(`<!--]-->`);
	$.bind_props($$props, { clear });
}