import * as $ from 'svelte/internal/server';
import { Chart, Layer, Spline, Trail } from 'layerchart';

import {
	curveLinear,
	curveNatural,
	curveBasis,
	curveBumpX,
	curveCatmullRom,
	curveMonotoneX
} from 'd3-shape';

export const title = 'Curves and caps';
export const description = 'The trail mark supports round and butt capping and different interpolation methods.';

export default function Curves($$renderer) {
	const curves = [
		{ label: 'linear', value: curveLinear },
		{ label: 'natural', value: curveNatural },
		{ label: 'basis', value: curveBasis },
		{ label: 'bump-x', value: curveBumpX },
		{ label: 'catmull-rom', value: curveCatmullRom },
		{ label: 'monotone-x', value: curveMonotoneX }
	];

	const caps = ['round', 'butt'];

	const data = [
		{ x: 0, y: 1, r: 2 },
		{ x: 1, y: 3, r: 8 },
		{ x: 2, y: 0.5, r: 14 },
		{ x: 3, y: 2, r: 5 }
	];

	$$renderer.push(`<div class="grid grid-cols-2 gap-4"><!--[-->`);

	const each_array = $.ensure_array_like(caps);

	for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
		let cap = each_array[$$index_1];

		$$renderer.push(`<div><div class="text-center text-sm font-semibold text-surface-content/60 mb-2">${$.escape(cap)}</div> <div class="flex flex-col gap-2"><!--[-->`);

		const each_array_1 = $.ensure_array_like(curves);

		for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
			let curve = each_array_1[$$index];

			$$renderer.push(`<div class="flex items-center gap-2">`);

			Chart($$renderer, {
				data,
				x: 'x',
				y: 'y',
				r: 'r',
				rRange: [2, 14],
				padding: 10,
				height: 60,
				class: 'flex-1',
				children: ($$renderer) => {
					Layer($$renderer, {
						children: ($$renderer) => {
							Trail($$renderer, { curve: curve.value, cap, class: 'fill-primary/40' });
							$$renderer.push(`<!----> `);

							Spline($$renderer, {
								curve: curve.value,
								class: 'stroke-surface-content/40 stroke-1'
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <span class="text-xs text-surface-content/50 w-24 shrink-0">${$.escape(curve.label)}</span></div>`);
		}

		$$renderer.push(`<!--]--></div></div>`);
	}

	$$renderer.push(`<!--]--></div>`);
}