import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	if (hello) {
		$$renderer.push(`<!--[0--><!--[-->`);

		const each_array = $.ensure_array_like(items);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let item = each_array[i];

			$$renderer.push(`<div>${$.escape(item)}${$.escape(i)}</div>`);
		}

		$$renderer.push(`<!--]--> `);

		if (hi && bye) {
			$$renderer.push('<!--[0-->');

			const each_array_1 = $.ensure_array_like(items);

			if (each_array_1.length !== 0) {
				$$renderer.push('<!--[-->');

				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let item = each_array_1[$$index_1];

					$$renderer.push(`<div>${$.escape(item)}</div>`);
				}
			} else {
				$$renderer.push(`<!--[!--><p>hi</p>`);
			}

			$$renderer.push(`<!--]-->`);
		} else if (cool) {
			$$renderer.push(`<!--[1--><!--[-->`);

			const each_array_2 = $.ensure_array_like(items);

			for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
				let item = each_array_2[i];

				$$renderer.push(`<div>${$.escape(item)}${$.escape(i)}</div>`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push(`<!--[-1--><!--[-->`);

			const each_array_3 = $.ensure_array_like(items);

			for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
				let item = each_array_3[$$index_3];

				$$renderer.push(`<div>${$.escape(item)}</div>`);
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]-->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}