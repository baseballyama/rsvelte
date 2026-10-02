import * as $ from 'svelte/internal/server';

export default function Attach_each($$renderer) {
	let items = [{ id: 1, label: 'a' }, { id: 2, label: 'b' }];
	function highlight(item) {
		return (node) => {
			node.dataset.label = item.label;
		};
	}
	$$renderer.push(`<ul><!--[-->`);
	const each_array = $.ensure_array_like(items);
	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let item = each_array[$$index];
		$$renderer.push(`<li>${$.escape(item.label)}</li>`);
	}
	$$renderer.push(`<!--]--></ul> `);
	if (items.length > 1) {
		$$renderer.push(`<!--[0--><section><h2>first</h2></section>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}
	$$renderer.push(`<!--]-->`);
}
