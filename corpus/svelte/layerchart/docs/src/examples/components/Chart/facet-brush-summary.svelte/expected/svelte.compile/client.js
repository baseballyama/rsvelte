import 'svelte/internal/disclose-version';
import { getPenguins } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { bin } from 'd3-array';
import { BarChart, Chart, ChartGroup, Circle, Points } from 'layerchart';
import { cls } from '@layerstack/tailwind';

const penguins = await getPenguins();
var root = $.from_html(`<div class="grid gap-2"><!> <div><div class="text-sm text-surface-content/70">Body mass (kg)</div> <!></div></div>`);

export default function Facet_brush_summary($$anchor, $$props) {
	$.push($$props, true);

	const data = penguins.filter((d) => d.flipper_length_mm !== 'NA' && d.body_mass_g !== 'NA');

	// Each bin keeps its rows, so the selected count is a filter over the bin rather than a
	// second pass over the data
	const bins = bin().value((d) => d.body_mass_g).thresholds(10)(data);

	const kg = (mass) => ((mass ?? 0) / 1000).toFixed(1);
	var $$exports = { data };

	{
		const children = ($$anchor, $$arg0) => {
			let group = () => ($$arg0?.()).group;

			const counts = $.derived(() => bins.map((b) => ({
				mass: kg(b.x0),
				total: b.length,
				selected: b.filter((d) => group().brush.contains({ x: d.flipper_length_mm, y: d.body_mass_g })).length
			})));

			var div = root();
			var node = $.child(div);

			{
				const marks = ($$anchor, $$arg0) => {
					let context = () => ($$arg0?.()).context;

					{
						const children = ($$anchor, $$arg0) => {
							let points = () => ($$arg0?.()).points;
							var fragment_2 = $.comment();
							var node_1 = $.first_child(fragment_2);

							$.each(node_1, 17, points, (point) => point.data, ($$anchor, point) => {
								const isSelected = $.derived(() => context().brush.contains({
									x: $.get(point).data.flipper_length_mm,
									y: $.get(point).data.body_mass_g
								}));

								{
									let $0 = $.derived(() => $.get(isSelected) ? 4 : 2.5);

									let $1 = $.derived(() => cls($.get(isSelected)
										? 'fill-primary/40 stroke-primary'
										: 'fill-neutral/10 stroke-neutral/30'));

									Circle($$anchor, {
										get cx() {
											return $.get(point).x;
										},

										get cy() {
											return $.get(point).y;
										},

										get r() {
											return $.get($0);
										},

										get class() {
											return $.get($1);
										},
										motion: 'spring'
									});
								}
							});

							$.append($$anchor, fragment_2);
						};

						Points($$anchor, { children, $$slots: { default: true } });
					}
				};

				Chart(node, {
					get data() {
						return data;
					},
					x: 'flipper_length_mm',
					y: 'body_mass_g',
					fx: 'species',
					xNice: true,
					yNice: true,
					grid: true,
					brush: { axis: 'both' },
					padding: { left: 52, bottom: 32, top: 24, right: 8 },
					height: 260,
					marks,
					$$slots: { marks: true }
				});
			}

			var div_1 = $.sibling(node, 2);
			var node_2 = $.sibling($.child(div_1), 2);

			BarChart(node_2, {
				get data() {
					return $.get(counts);
				},
				x: 'mass',
				series: [
					{
						key: 'total',
						color: 'var(--color-surface-content)',
						props: { opacity: 0.15 }
					},
					{ key: 'selected', color: 'var(--color-primary)' }
				],
				seriesLayout: 'overlap',
				groupOptions: { publish: false, subscribe: false },
				props: { bars: { motion: 'spring' } },
				legend: false,
				padding: { left: 32, bottom: 24 },
				height: 140
			});

			$.reset(div_1);
			$.reset(div);
			$.append($$anchor, div);
		};

		ChartGroup($$anchor, {
			brush: { axis: 'both' },
			children,
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}