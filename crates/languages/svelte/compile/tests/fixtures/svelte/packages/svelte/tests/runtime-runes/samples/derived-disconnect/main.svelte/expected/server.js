import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const items = [
		{ id: 1, name: "a" },
		{ id: 2, name: "b" },
		{ id: 3, name: "c" },
		{ id: 4, name: "d" }
	];

	let currentId = 1;
	let currentItem = $.derived(() => items.find((item) => item.id === currentId));
	let visible = true;

	$$renderer.push(`<main>`);

	if (visible) {
		$$renderer.push(`<!--[0--><div>Current ID: ${$.escape(currentId)}</div> <div>Name: ${$.escape(currentItem().name)}</div> <!--[-->`);

		const each_array = $.ensure_array_like(items);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];

			$$renderer.push(`<div><button>${$.escape(item.name)}</button></div>`);
		}

		$$renderer.push(`<!--]-->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> <hr/> <div><button>Show / Hide</button></div></main>`);
}