import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let items = [];

		const proxy = new Proxy(items, {
			get: (target, prop) => {
				try {} catch {}

				return Reflect.get(target, prop);
			}
		});

		function add() {
			items.push(items.length + 1);
		}

		function remove() {
			items.pop();
		}

		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(proxy);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];

			$$renderer.push(`<span>${$.escape(item)}</span>`);
		}

		$$renderer.push(`<!--]--> <button class="add">add</button> <button class="remove">remove</button>`);
	});
}