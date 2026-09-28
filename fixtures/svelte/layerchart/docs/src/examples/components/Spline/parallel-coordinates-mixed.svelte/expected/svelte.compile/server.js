import * as $ from 'svelte/internal/server';
import { Axis, Brush, BrushState, Chart, Group, Spline, pivotLonger } from 'layerchart';
import { extent } from 'd3-array';
import { scaleLinear, scalePoint } from 'd3-scale';
import { getIris } from '$lib/data.remote';

const iris = await getIris();

export default function Parallel_coordinates_mixed($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const dimensions = {
			sepal_length: 'Sepal length',
			sepal_width: 'Sepal width',
			petal_length: 'Petal length',
			petal_width: 'Petal width',
			species: 'Species'
		};

		const keys = Object.keys(dimensions);
		const species = [...new Set(iris.map((d) => d.species))];

		// `species` is both a dimension and the color, and pivoting consumes the columns it reads —
		// so the color keeps a copy of its own
		const rows = iris.map((d, id) => ({ ...d, id, group: d.species }));

		/**
		 * One scale per dimension, each normalized to `0–1` so every dimension shares the chart's `y`.
		 * A categorical dimension takes a point scale over its values, where a quantitative one takes a
		 * linear scale over its extent.
		 */
		const scales = new Map(keys.map((key) => [
			key,
			key === 'species'
				? // `padding` keeps the categories off the ends of the axis, so each sits in the middle
				// of its own slice — brushing near one takes it, rather than needing the exact point
				scalePoint().domain(species).range([0, 1]).padding(0.5)
				: scaleLinear().domain(extent(rows, (d) => d[key]))
		]));

		const data = pivotLonger(rows, keys, 'dimension', 'value');

		// One selection per dimension, each owned by its `<Brush>` below and read back here
		let brushes = {};

		const active = $.derived(() => keys.filter((k) => brushes[k]?.active));

		// A flower is kept when it falls inside *every* brushed dimension
		const selectedIds = $.derived(() => new Set(rows.filter((row) => active().every((k) => brushes[k].contains({ y: scales.get(k)(row[k]) }))).map((d) => d.id)));

		const BRUSH_WIDTH = 24;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="text-sm text-surface-content/70 mb-2">${$.escape(selectedIds().size)} of ${$.escape(rows.length)} flowers `);

			if (active().length) {
				$$renderer.push(`<!--[0-->· brushed on ${$.escape(active().map((k) => dimensions[k]).join(', '))}`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> `);

			{
				function axis($$renderer, { context }) {
					Axis($$renderer, {
						placement: 'top',
						format: (d) => dimensions[d],
						tickLength: 0
					});

					$$renderer.push(`<!----> <!--[-->`);

					const each_array = $.ensure_array_like(keys);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let key = each_array[$$index];

						Group($$renderer, {
							x: context.xScale(key),
							children: ($$renderer) => {
								Axis($$renderer, {
									placement: 'left',
									scale: scales.get(key).copy().range([context.height, 0]),
									ticks: key === 'species' ? species : 6,
									rule: true
								});

								$$renderer.push(`<!----> `);

								Brush($$renderer, {
									axis: 'y',
									x: -BRUSH_WIDTH / 2,
									width: BRUSH_WIDTH,
									classes: { selection: 'stroke-surface-content/80' },
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

				function marks($$renderer, { context }) {
					Spline($$renderer, {
						stroke: (d) => selectedIds().has(d.id)
							? context.cScale?.(d.group)
							: 'var(--color-surface-content)',
						strokeWidth: 1,
						opacity: (d) => selectedIds().has(d.id) ? 0.5 : 0.03
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
					c: 'group',
					cDomain: species,
					cRange: [
						'var(--color-info)',
						'var(--color-success)',
						'var(--color-warning)'
					],
					padding: { left: 48, right: 72, top: 32, bottom: 8 },
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