import 'svelte/internal/disclose-version';
import { getMetros } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { scaleDiverging, scaleLog } from 'd3-scale';
import { interpolateRdBu } from 'd3-scale-chromatic';
import { format } from '@layerstack/utils';
import { Axis, Chart, Layer, Legend, Link, Text } from 'layerchart';

const data = await getMetros();
var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex justify-end mb-2"><!></div> <!>`, 1);

export default function Bended_arrows($$anchor, $$props) {
	$.push($$props, true);

	// Inequality change from 1980 → 2015 — positive means more unequal.
	// Reverse RdBu so red = increased inequality, blue = decreased.
	const colorScale = scaleDiverging([-4, 0, 4], (t) => interpolateRdBu(1 - t));

	const highlighted = data.filter((d) => d.highlight === 1);
	var $$exports = { data };
	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Legend(node, {
		get scale() {
			return colorScale;
		},
		title: 'Change in inequality from 1980 to 2015',
		tickFormat: (v) => v > 0 ? `+${v}` : `${v}`,
		class: 'max-w-sm'
	});

	$.reset(div);

	var node_1 = $.sibling(div, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;

			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_2 = $.first_child(fragment_2);

					Axis(node_2, {
						placement: 'bottom',
						grid: true,
						label: 'Population',
						format: (v) => {
							const mag = Math.pow(10, Math.floor(Math.log10(v)));

							return v / mag <= 4 ? format(v, 'metric') : '';
						}
					});

					var node_3 = $.sibling(node_2, 2);

					Axis(node_3, {
						placement: 'left',
						grid: true,
						label: 'Inequality (90/10 ratio)'
					});

					var node_4 = $.sibling(node_3, 2);

					Link(node_4, {
						x1: 'POP_1980',
						y1: 'R90_10_1980',
						x2: 'POP_2015',
						y2: 'R90_10_2015',
						type: 'swoop',
						bend: 22.5,
						markerEnd: 'arrow',
						strokeWidth: 1.5,
						class: (d) => context().tooltip.data == null
							? ''
							: context().tooltip.data.Metro === d.Metro ? 'stroke-2' : 'opacity-10'
					});

					var node_5 = $.sibling(node_4, 2);

					{
						let $0 = $.derived(() => context().tooltip.data ? [context().tooltip.data] : highlighted);

						Text(node_5, {
							get data() {
								return $.get($0);
							},
							x: 'POP_2015',
							y: 'R90_10_2015',
							value: 'nyt_display',
							textAnchor: 'middle',
							dy: -8,
							class: 'text-xs text-current stroke-2 stroke-surface-100 font-semibold pointer-events-none'
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		};

		let $0 = $.derived(scaleLog);

		Chart(node_1, {
			get data() {
				return data;
			},
			x: ['POP_1980', 'POP_2015'],
			y: ['R90_10_1980', 'R90_10_2015'],
			get xScale() {
				return $.get($0);
			},
			c: (d) => d.R90_10_2015 - d.R90_10_1980,
			get cScale() {
				return colorScale;
			},
			cDomain: [-4, 0, 4],
			xPadding: [10, 30],
			yPadding: [10, 20],
			padding: { top: 20, right: 20, bottom: 32, left: 40 },
			tooltipContext: { mode: 'quadtree', x: 'POP_2015', y: 'R90_10_2015' },
			height: 500,
			children,
			$$slots: { default: true }
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}