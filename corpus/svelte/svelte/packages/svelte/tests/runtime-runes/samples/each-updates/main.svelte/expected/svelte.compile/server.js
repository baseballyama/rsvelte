import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let data = { items: [] };

		function fetchData() {
			data = {
				items: [
					{ id: 1, price: 1, name: 'test' },
					{ id: 2, price: 2, name: 'test 2' }
				]
			};
		}

		fetchData();

		function copyItems(original) {
			return [...original.map((item) => ({ ...item }))];
		}

		let items = void 0;

		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(items);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];

			$$renderer.push(`<p>${$.escape(item.name)} costs $${$.escape(item.price)}</p>`);
		}

		$$renderer.push(`<!--]--> <!--[-->`);

		const each_array_1 = $.ensure_array_like(items);

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let item = each_array_1[$$index_1];

			$$renderer.push(`<p>${$.escape(item.name)} costs $${$.escape(item.price)}</p>`);
		}

		$$renderer.push(`<!--]--> <button>add</button> <button>change</button> <button>reload</button>`);
	});
}