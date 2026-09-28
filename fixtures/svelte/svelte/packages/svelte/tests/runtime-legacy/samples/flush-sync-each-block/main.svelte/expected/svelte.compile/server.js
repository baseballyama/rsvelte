import * as $ from 'svelte/internal/server';
import "./Inner.svelte";

export default function Main($$renderer) {
	let count = 1;

	$$renderer.push(`<button>inc</button> <my-inner${$.attr('value', count)}></my-inner> <!--[-->`);

	const each_array = $.ensure_array_like([count]);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let row = each_array[$$index];

		$$renderer.push(`<!---->${$.escape(row)}`);
	}

	$$renderer.push(`<!--]-->`);
}