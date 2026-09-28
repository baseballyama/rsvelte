import * as $ from 'svelte/internal/server';

import {
	Axis,
	Brush,
	BrushState,
	Chart,
	Group,
	Spline,
	Text,
	pivotLonger
} from 'layerchart';

import { extent } from 'd3-array';
import { scaleLinear, scalePoint } from 'd3-scale';
import { getPenguins } from '$lib/data.remote';

const penguins = await getPenguins();

export default function Parallel_coordinates_brush($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const dimensions = {
			bill_length_mm: 'Bill length',
			bill_depth_mm: 'Bill depth',
			flipper_length_mm: 'Flipper length',
			body_mass_g: 'Body mass'
		};

		const keys = Object.keys(dimensions);
		const rows = penguins.filter((d) => keys.every((k) => d[k] !== 'NA')).map((d, id) => ({ ...d, id }));

		// One scale per dimension, normalizing to `0–1` so every dimension shares the chart's `y`
		const scales = new Map(keys.map((k) => [k, scaleLinear().domain(extent(rows, (d) => d[k]))]));

		const data = pivotLonger(rows, keys, 'dimension', 'value');

		// One selection per dimension, each owned by its `<Brush>` below and read back here
		let brushes = {};

		const active = $.derived(() => keys.filter((k) => brushes[k]?.active));

		// A penguin is kept when it falls inside *every* brushed dimension
		const selectedIds = $.derived(() => new Set(rows.filter((row) => active().every((k) => brushes[k].contains({ y: scales.get(k)(row[k]) }))).map((d) => d.id)));

		const BRUSH_WIDTH = 24;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="text-sm text-surface-content/70 mb-2">${$.escape(selectedIds().size)} of ${$.escape(rows.length)} penguins `);

			if (active().length) {
				$$renderer.push(`<!--[0-->· brushed on ${$.escape(active().map((k) => dimensions[k]).join(', '))}`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> `);

			{
				function axis($$renderer, { context }) {
					$$renderer.push(`<!--[-->`);

					const each_array = $.ensure_array_like(keys);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let key = each_array[$$index];

						Group($$renderer, {
							x: context.xScale(key),
							children: ($$renderer) => {
								Axis($$renderer, {
									placement: 'left',
									scale: scales.get(key)?.copy().range([context.height, 0]),
									ticks: 6,
									rule: true
								});

								$$renderer.push(`<!----> `);

								Text($$renderer, {
									value: dimensions[key],
									y: -12,
									textAnchor: 'middle',
									class: 'text-xs font-medium fill-surface-content'
								});

								$$renderer.push(`<!----> `);

								Brush($$renderer, {
									axis: 'y',
									x: -BRUSH_WIDTH / 2,
									width: BRUSH_WIDTH,
									classes: { selection: 'fill-primary/15 stroke-primary/50' },
									get state() {
										return brushes[key];
									},

									set state($$value) {
										brushes[key] = $$value;
										$$settled = false;
									}
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!--]-->`);
				}

				function marks($$renderer) {
					Spline($$renderer, {
						stroke: (d) => selectedIds().has(d.id)
							? 'var(--color-primary)'
							: 'var(--color-surface-content)',
						strokeWidth: 1,
						opacity: (d) => selectedIds().has(d.id) ? 0.4 : 0.03
					});
				}

				Chart($$renderer, {
					data,
					x: 'dimension',
					xScale: scalePoint(),
					xDomain: keys,
					y: (d) => scales.get(d.dimension)?.(d.value),
					yDomain: [0, 1],
					z: 'id',
					padding: { left: 48, right: 48, top: 32, bottom: 8 },
					height: 400,
					axis,
					marks,
					$$slots: { axis: true, marks: true }
				});
			}

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { data });
	});
}