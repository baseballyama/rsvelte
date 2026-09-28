import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let list = [
			{ id: 1, text: '1' },
			{ id: 2, text: '2' },
			{ id: 3, text: '3' }
		];

		$$renderer.push(`<button>add 4</button> <button>add 5</button> <button>modify 3</button> <!--[-->`);

		const each_array = $.ensure_array_like(list);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];

			$$renderer.push(`<!---->${$.escape(item.text)}`);
		}

		$$renderer.push(`<!--]-->`);
	});
}