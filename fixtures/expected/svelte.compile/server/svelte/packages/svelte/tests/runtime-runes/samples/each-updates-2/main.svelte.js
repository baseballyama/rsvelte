import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let arr = [];
	let counter = 0;

	function addItem() {
		arr.push(`${counter++}`);
	}

	function removeItem(i) {
		arr.splice(i, 1);
	}

	$$renderer.push(`<button>Add Item</button> <!--[-->`);

	const each_array = $.ensure_array_like(arr);

	for (let i = 0, $$length = each_array.length; i < $$length; i++) {
		let item = each_array[i];

		$$renderer.push(`<button>Index ${$.escape(i)} | Item ${$.escape(item)}</button>`);
	}

	$$renderer.push(`<!--]-->`);
}