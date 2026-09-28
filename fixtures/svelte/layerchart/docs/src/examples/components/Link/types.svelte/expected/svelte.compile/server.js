import * as $ from 'svelte/internal/server';
import { Chart, Circle, Layer, Link } from 'layerchart';

export const title = 'Link types';
export const description = 'Link supports several path types across cartesian and radial orientations.';

export default function Types($$renderer) {
	const types = ['straight', 'square', 'beveled', 'rounded', 'swoop', 'd3'];

	const orientations = [
		{ label: 'horizontal', value: 'horizontal' },
		{ label: 'vertical', value: 'vertical' }
	];

	const chartHeight = 100;
	const pad = 16;

	$$renderer.push(`<div class="grid gap-4"${$.attr_style(`grid-template-columns: repeat(${$.stringify(orientations.length)}, minmax(0, 1fr));`)}><!--[-->`);

	const each_array = $.ensure_array_like(orientations);

	for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
		let { label, value } = each_array[$$index_1];

		$$renderer.push(`<div><div class="text-center text-sm font-semibold text-surface-content/60 mb-2">${$.escape(label)}</div> <div class="flex flex-col gap-2"><!--[-->`);

		const each_array_1 = $.ensure_array_like(types);

		for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
			let type = each_array_1[$$index];

			$$renderer.push(`<div class="flex items-center gap-2">`);

			{
				function children($$renderer, { context }) {
					const x1 = 0;
					const y1 = 0;
					const x2 = context.width;
					const y2 = context.height;

					Layer($$renderer, {
						children: ($$renderer) => {
							Link($$renderer, {
								x1,
								y1,
								x2,
								y2,
								type,
								orientation: value,
								class: 'stroke-primary stroke-2 fill-none'
							});

							$$renderer.push(`<!----> `);
							Circle($$renderer, { cx: x1, cy: y1, r: 4, class: 'fill-info' });
							$$renderer.push(`<!----> `);
							Circle($$renderer, { cx: x2, cy: y2, r: 4, class: 'fill-accent' });
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				}

				Chart($$renderer, {
					height: chartHeight,
					padding: pad,
					class: 'flex-1',
					children,
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!----> <span class="text-xs text-surface-content/50 w-20 shrink-0">${$.escape(type)}</span></div>`);
		}

		$$renderer.push(`<!--]--></div></div>`);
	}

	$$renderer.push(`<!--]--></div>`);
}