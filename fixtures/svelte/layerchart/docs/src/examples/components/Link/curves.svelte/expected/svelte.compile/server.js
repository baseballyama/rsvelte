import * as $ from 'svelte/internal/server';
import { Chart, Circle, Layer, Link } from 'layerchart';

import {
	curveBumpX,
	curveBumpY,
	curveLinear,
	curveCatmullRom,
	curveMonotoneX,
	curveMonotoneY,
	curveStep,
	curveStepBefore,
	curveStepAfter
} from 'd3-shape';

export const title = 'D3 curves';
export const description = 'When `type="d3"`, Link supports any d3 curve factory. Step curves are axis-aware via `orientation`.';

export default function Curves($$renderer) {
	const curves = [
		{ label: 'default', value: undefined },
		{ label: 'linear', value: curveLinear },
		{ label: 'bumpX', value: curveBumpX },
		{ label: 'bumpY', value: curveBumpY },
		{ label: 'catmullRom', value: curveCatmullRom },
		{ label: 'monotoneX', value: curveMonotoneX },
		{ label: 'monotoneY', value: curveMonotoneY },
		{ label: 'step', value: curveStep },
		{ label: 'stepBefore', value: curveStepBefore },
		{ label: 'stepAfter', value: curveStepAfter }
	];

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

		const each_array_1 = $.ensure_array_like(curves);

		for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
			let curve = each_array_1[$$index];

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
								type: 'd3',
								curve: curve.value,
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

			$$renderer.push(`<!----> <span class="text-xs text-surface-content/50 w-24 shrink-0">${$.escape(curve.label)}</span></div>`);
		}

		$$renderer.push(`<!--]--></div></div>`);
	}

	$$renderer.push(`<!--]--></div>`);
}