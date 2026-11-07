import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let items = [];

	function add_item() {
		items.push({
			id: items.length,
			text: 'Item ' + (items.length + 1),
			html: '<div>Item ' + (items.length + 1) + '</div>',
			dom: null
		});
	}

	function make_span() {
		items.forEach((item) => {
			item.html = item.html.replace(/div/g, 'span');
		});
	}

	function reverse() {
		items.reverse();
	}

	$$renderer.push(`<button>add item</button> <button>make span</button> <button>reverse</button> <!--[-->`);

	const each_array = $.ensure_array_like(items);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let item = each_array[$$index];

		$$renderer.push(`${$.html(item.html)}`);
	}

	$$renderer.push(`<!--]-->`);
}