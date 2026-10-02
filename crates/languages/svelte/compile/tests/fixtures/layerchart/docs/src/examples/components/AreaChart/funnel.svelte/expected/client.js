import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { accessor, Area, AreaChart, LinearGradient, Text } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';
import { curveBasis } from 'd3-shape';

var root = $.from_html(`<!> <!>`, 1);

export default function Funnel($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });

	const funnelSegments = [
		{ index: 0, value: 100 },
		{ index: 1, value: 50 },
		{ index: 2, value: 25 },
		{ index: 3, value: 10 },
		{ index: 4, value: 2.5 }
	];

	function interpolateData(data, options) {
		const x = accessor(options.x);
		const y = accessor(options.y);

		return data.flatMap((current, i, arr) => {
			if (i === arr.length - 1) {
				return current;
			}

			const next = arr[i + 1];
			const xStep = 0.25;
			const yStep = Math.abs(y(next) - y(current)) * 0.03;
			const xMid1 = Math.abs(x(current) + xStep);
			const yMid1 = Math.abs(y(current) - yStep);
			const xMid2 = Math.abs(x(next) - xStep);
			const yMid2 = Math.abs(y(next) + yStep);

			return [
				current,
				{ [options.x]: xMid1, [options.y]: yMid1 },
				{ [options.x]: xMid2, [options.y]: yMid2 }
			];
		});
	}

	var $$exports = { data };

	{
		const marks = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			const segmentWidth = $.derived(() => context().width / (funnelSegments.length - 1));

			const areas = $.derived(() => [
				{ padding: 0, opacity: 1 },
				{ padding: 10, opacity: 0.2 },
				{ padding: 20, opacity: 0.1 }
			]);

			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			{
				const children = ($$anchor, $$arg0) => {
					let gradient = () => ($$arg0?.()).gradient;
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					$.each(node_1, 17, () => $.get(areas), $.index, ($$anchor, a) => {
						Area($$anchor, {
							y0: (d) => d.value + $.get(a).padding,
							y1: (d) => -(d.value + $.get(a).padding),
							get fill() {
								return gradient();
							},

							get curve() {
								return curveBasis;
							}
						});
					});

					$.append($$anchor, fragment_2);
				};

				LinearGradient(node, {
					class: 'from-primary/50 to-secondary/10',
					children,
					$$slots: { default: true }
				});
			}

			var node_2 = $.sibling(node, 2);

			$.each(node_2, 17, () => funnelSegments.slice(0, -1), $.index, ($$anchor, s) => {
				{
					let $0 = $.derived(() => $.get(s).value + '%');
					let $1 = $.derived(() => context().xScale(context().x($.get(s))) + $.get(segmentWidth) / 2);
					let $2 = $.derived(() => context().height / 2);

					Text($$anchor, {
						get value() {
							return $.get($0);
						},

						get x() {
							return $.get($1);
						},

						get y() {
							return $.get($2);
						},
						textAnchor: 'middle',
						verticalAnchor: 'middle',
						class: 'text-2xl fill-current opacity-70',
						dy: 3
					});
				}
			});

			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(() => interpolateData(funnelSegments, { x: 'index', y: 'value' }));

		let $1 = $.derived(() => ({
			grid: {
				x: { class: 'stroke-2 stroke-surface-content/20' },
				y: false,
				xTicks: funnelSegments.map((d) => d.index)
			}
		}));

		AreaChart($$anchor, {
			get data() {
				return $.get($0);
			},
			x: 'index',
			y: [(d) => d.value, (d) => -d.value],
			axis: false,
			yPadding: [20, 20],
			get props() {
				return $.get($1);
			},
			tooltipContext: false,
			height: 400,
			marks,
			$$slots: { marks: true }
		});
	}

	return $.pop($$exports);
}