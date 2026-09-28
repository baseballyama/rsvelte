import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let array = [1];

	$$renderer.push(`<div class="svelte-bbx1ep"></div> <!--[-->`);

	const each_array = $.ensure_array_like(array);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let item = each_array[$$index];

		$$renderer.push(`<span class="each svelte-bbx1ep"></span> <div class="each svelte-bbx1ep"></div> <span class="each svelte-bbx1ep"></span> <div class="each svelte-bbx1ep"></div>`);
	}

	$$renderer.push(`<!--]--> <span class="svelte-bbx1ep"></span>`);
}