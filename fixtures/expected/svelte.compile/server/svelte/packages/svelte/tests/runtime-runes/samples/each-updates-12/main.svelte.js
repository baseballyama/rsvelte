import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	function fade(node) {
		return {
			duration: 1000,
			tick(t) {
				node.style.opacity = t;
			}
		};
	}

	let items = [1, 2];

	$$renderer.push(`<button>clear</button> <button>push</button> <!--[-->`);

	const each_array = $.ensure_array_like(items);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let item = each_array[$$index];

		$$renderer.push(`<span>${$.escape(item)}</span>`);
	}

	$$renderer.push(`<!--]-->`);
}