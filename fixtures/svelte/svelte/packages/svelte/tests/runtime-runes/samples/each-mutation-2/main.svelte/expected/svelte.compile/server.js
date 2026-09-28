import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let numbers = [{ id: 1 }, { id: 2 }, { id: 3 }];

	$$renderer.push(`<button>push</button> <button>pop</button> <!--[-->`);

	const each_array = $.ensure_array_like(numbers);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let number = each_array[$$index];

		$$renderer.push(`<p>${$.escape(number.id)}</p>`);
	}

	$$renderer.push(`<!--]-->`);
}