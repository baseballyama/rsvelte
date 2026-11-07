import * as $ from 'svelte/internal/server';

export default function Comp_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;

		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(data.obj.arr);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let i = each_array[$$index];

			$$renderer.push(`<p>${$.escape(i)}</p>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}