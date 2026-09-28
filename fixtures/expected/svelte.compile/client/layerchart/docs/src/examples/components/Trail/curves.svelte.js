import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex items-center gap-2"><!> <span class="text-xs text-surface-content/50 w-24 shrink-0"> </span></div>`);
var root_2 = $.from_html(`<div><div class="text-center text-sm font-semibold text-surface-content/60 mb-2"> </div> <div class="flex flex-col gap-2"></div></div>`);
var root_3 = $.from_html(`<div class="grid grid-cols-2 gap-4"></div>`);

export default function Curves($$anchor) {
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

	var div = root_3();

	$.each(div, 20, () => caps, (cap) => cap, ($$anchor, cap) => {
		var div_1 = root_2();
		var div_2 = $.child(div_1);
		var text = $.only_child(div_2, true);
		var div_3 = $.sibling(div_2, 2);

		$.each(div_3, 21, () => curves, (curve) => curve.label, ($$anchor, curve) => {
			var div_4 = root_1();
			var node = $.child(div_4);

			Chart(node, {
				get data() {
					return data;
				},
				x: 'x',
				y: 'y',
				r: 'r',
				rRange: [2, 14],
				padding: 10,
				height: 60,
				class: 'flex-1',
				children: ($$anchor, $$slotProps) => {
					Layer($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root();
							var node_1 = $.first_child(fragment_1);

							Trail(node_1, {
								get curve() {
									return $.get(curve).value;
								},

								get cap() {
									return cap;
								},
								class: 'fill-primary/40'
							});

							var node_2 = $.sibling(node_1, 2);

							Spline(node_2, {
								get curve() {
									return $.get(curve).value;
								},
								class: 'stroke-surface-content/40 stroke-1'
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var span = $.sibling(node, 2);
			var text_1 = $.only_child(span, true);

			$.reset(div_4);
			$.template_effect(() => $.set_text(text_1, $.get(curve).label));
			$.append($$anchor, div_4);
		});

		$.reset(div_3);
		$.reset(div_1);
		$.template_effect(() => $.set_text(text, cap));
		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.append($$anchor, div);
}