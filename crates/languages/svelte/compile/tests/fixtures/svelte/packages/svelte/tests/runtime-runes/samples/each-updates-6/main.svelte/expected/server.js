import * as $ from 'svelte/internal/server';

function renderItem($$renderer, item) {
	$$renderer.push(`<li>${$.escape(item.name)} (${$.escape(item.id)}) `);

	if (item.color) {
		$$renderer.push(`<!--[0--><span${$.attr_style(`background-color: ${$.stringify(item.color)}; width: 20px; height: 20px; display: inline-block;`)}></span>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></li>`);
}

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const items = [
			{ name: 'test', id: 1, color: 'red' },
			{ name: 'test 2', id: 2 },
			{ name: 'test 3', id: 3 }
		];

		const onclick = () => {
			const from = 0;
			const to = 2;

			items.splice(to, 0, items.splice(from, 1)[0]);
		};

		$$renderer.push(`<ul><!--[-->`);

		const each_array = $.ensure_array_like(items);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];

			renderItem($$renderer, item);
		}

		$$renderer.push(`<!--]--></ul> <button>Swap items 1 &amp; 3</button>`);
	});
}