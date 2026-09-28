import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let data = [[0, 0], [0, 4], [1, 4]];

	function add() {
		const n = [0, 0];

		data.push(n);
		data = data;
	}

	$$renderer.push(`<button>add</button> <ul><!--[-->`);

	const each_array = $.ensure_array_like(data);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let d = each_array[$$index];

		$$renderer.push(`<li>${$.escape(d)}</li>`);
	}

	$$renderer.push(`<!--]--></ul>`);
}