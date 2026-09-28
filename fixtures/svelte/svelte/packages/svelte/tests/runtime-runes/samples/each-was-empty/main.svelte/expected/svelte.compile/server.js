import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let list = void 0;
	let count = 0;

	function increment() {
		count += 1;
	}

	$$renderer.push(`<button>clicks: ${$.escape(count)}</button> <button>undefined</button> <button>null</button> <button>empty</button> <button>[1,2,3]</button> <ul>`);

	const each_array = $.ensure_array_like(list);

	if (each_array.length !== 0) {
		$$renderer.push('<!--[-->');

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let a = each_array[$$index];

			$$renderer.push(`<li>item : ${$.escape(a)}</li>`);
		}
	} else {
		$$renderer.push(`<!--[!--><li>count = <span>${$.escape(count)}</span></li>`);
	}

	$$renderer.push(`<!--]--></ul>`);
}