import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let items = [4, 5, 6];

	$$renderer.push(`<button>step back</button> <button>step forward</button> <button>jump back</button> <button>jump forward</button> <div><!--[-->`);

	const each_array = $.ensure_array_like(items);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let item = each_array[$$index];

		$$renderer.push(`<p>${$.escape(item)}</p>`);
	}

	$$renderer.push(`<!--]--></div>`);
}