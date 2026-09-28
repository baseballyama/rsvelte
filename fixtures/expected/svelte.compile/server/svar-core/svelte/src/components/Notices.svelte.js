import * as $ from 'svelte/internal/server';
import Notice from "./Notice.svelte";

export default function Notices($$renderer, $$props) {
	let { data = [] } = $$props;

	$$renderer.push(`<div class="wx-notices svelte-2lhd9z"><!--[-->`);

	const each_array = $.ensure_array_like(data);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let notice = each_array[$$index];

		Notice($$renderer, { notice });
	}

	$$renderer.push(`<!--]--></div>`);
}