import * as $ from 'svelte/internal/server';

export default function Class_each($$renderer) {
	let selected = 1;
	let items = [{ id: 1, name: 'one', done: false }, { id: 2, name: 'two', done: true }];
	$$renderer.push(`<ul><!--[-->`);
	const each_array = $.ensure_array_like(items);
	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let item = each_array[$$index];
		$$renderer.push(`<li${$.attr_class('row', void 0, { 'selected': item.id === selected, 'done': item.done })}><button${$.attr_class($.clsx({ current: item.id === selected }))}>${$.escape(item.name)}</button></li>`);
	}
	$$renderer.push(`<!--]--></ul>`);
}
