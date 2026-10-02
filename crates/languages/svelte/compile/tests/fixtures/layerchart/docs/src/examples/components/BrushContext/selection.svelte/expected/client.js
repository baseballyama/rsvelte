import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { range } from 'd3-array';
import { Axis, Chart, Circle, Layer, Points, defaultChartPadding } from 'layerchart';
import { cls } from '@layerstack/tailwind';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Selection($$anchor, $$props) {
	$.push($$props, true);

	const data = range(200).map((d) => {
		return { x: d, y: Math.random() };
	});

	var $$exports = { data };

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;

			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					Axis(node, { placement: 'left', grid: true, rule: true });

					var node_1 = $.sibling(node, 2);

					Axis(node_1, { placement: 'bottom', rule: true });

					var node_2 = $.sibling(node_1, 2);

					{
						const children = ($$anchor, $$arg0) => {
							let points = () => ($$arg0?.()).points;
							var fragment_3 = $.comment();
							var node_3 = $.first_child(fragment_3);

							$.each(node_3, 17, points, $.index, ($$anchor, point) => {
								const isSelected = $.derived(() => context().brush.contains($.get(point).data));

								{
									let $0 = $.derived(() => $.get(isSelected) ? 4 : 2);

									let $1 = $.derived(() => cls($.get(isSelected)
										? 'fill-primary/30 stroke-primary'
										: 'fill-neutral/10 stroke-neutral'));

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

							$.append($$anchor, fragment_3);
						};

						Points(node_2, { children, $$slots: { default: true } });
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		};

		let $0 = $.derived(() => defaultChartPadding({ top: 20, left: 20, bottom: 24 }));

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: 'x',
			y: 'y',
			yDomain: [0, null],
			yNice: true,
			get padding() {
				return $.get($0);
			},
			brush: { axis: 'both' },
			height: 400,
			children,
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}