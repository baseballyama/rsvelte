import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let arr = [100, 0, 50];
		let nextValues = [20, 80];
		let valueIndex = 0;

		function addItem() {
			if (valueIndex < nextValues.length) {
				arr.push(nextValues[valueIndex]);
				valueIndex++;
			}
		}

		$$renderer.push(`<button>add item</button> <!--[-->`);

		const each_array = $.ensure_array_like(arr);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let x = each_array[$$index];

			$$renderer.push(`<p>${$.escape(x)}</p>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}