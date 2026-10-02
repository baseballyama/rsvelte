import * as $ from 'svelte/internal/server';

import { renderList, toDisplayString } from 'vue';

export default function List_vue($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let items = [{ id: 1, name: 'apple' }, { id: 2, name: 'banana' }];
		let next = 3;
		function add() {
			items.push({ id: next, name: `item ${next}` });
			next++;
		}
		function removeFirst() {
			items.shift();
		}
		$$renderer.push(`<ul><!--[-->`);
		const each_array = $.ensure_array_like(renderList(items, (value_1, key) => [value_1, key]));
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let entry = each_array[$$index];
			$$renderer.push(`<li>${$.escape(toDisplayString(entry[1] + 1))}. ${$.escape(toDisplayString(entry[0].name))}</li>`);
		}
		$$renderer.push(`<!--]--></ul>`);
		if (items.length === 0) {
			$$renderer.push(`<!--[0--><p>empty</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}
		$$renderer.push(`<!--]--><button class="add">add</button><button class="remove">remove first</button>`);
	});
}
