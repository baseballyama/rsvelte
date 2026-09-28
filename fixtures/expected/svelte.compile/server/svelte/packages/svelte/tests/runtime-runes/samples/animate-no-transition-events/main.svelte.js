import * as $ from 'svelte/internal/server';
import { flip } from "svelte/animate";

export default function Main($$renderer) {
	let numbers = [0, 1];

	$$renderer.push(`<button>reverse</button> <!--[-->`);

	const each_array = $.ensure_array_like(numbers);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let num = each_array[$$index];

		$$renderer.push(`<div>${$.escape(num)}</div>`);
	}

	$$renderer.push(`<!--]-->`);
}