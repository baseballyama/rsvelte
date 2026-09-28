import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';

export default function DisposeN($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { count } = $$props;

		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(Array(count).keys());

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let index = each_array[$$index];

			if (T.Mesh) {
				$$renderer.push('<!--[-->');

				T.Mesh($$renderer, {
					name: `mesh-${$.stringify(index)}`,
					children: ($$renderer) => {
						if (T.PlaneGeometry) {
							$$renderer.push('<!--[-->');
							T.PlaneGeometry($$renderer, { args: [index, index, index] });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		$$renderer.push(`<!--]-->`);
	});
}