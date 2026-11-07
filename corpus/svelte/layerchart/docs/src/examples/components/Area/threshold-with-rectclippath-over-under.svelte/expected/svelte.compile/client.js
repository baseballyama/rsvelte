import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Area, Axis, Chart, Layer, RectClipPath, Rule } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Threshold_with_rectclippath_over_under($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({ count: 30, min: -20, max: 50, value: 'integer' });
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

					Axis(node_1, { placement: 'bottom' });

					var node_2 = $.sibling(node_1, 2);

					Rule(node_2, { y: 0 });

					var node_3 = $.sibling(node_2, 2);

					{
						let $0 = $.derived(() => context().yScale(0));

						RectClipPath(node_3, {
							x: 0,
							y: 0,
							get width() {
								return context().width;
							},

							get height() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								Area($$anchor, {
									line: { class: 'stroke-2 stroke-success' },
									class: 'fill-success/20'
								});
							},
							$$slots: { default: true }
						});
					}

					var node_4 = $.sibling(node_3, 2);

					{
						let $0 = $.derived(() => context().yScale(0));
						let $1 = $.derived(() => context().height - context().yScale(0));

						RectClipPath(node_4, {
							x: 0,
							get y() {
								return $.get($0);
							},

							get width() {
								return context().width;
							},

							get height() {
								return $.get($1);
							},

							children: ($$anchor, $$slotProps) => {
								Area($$anchor, {
									y0: (d) => 0,
									line: { class: 'stroke-2 stroke-danger' },
									class: 'fill-danger/20'
								});
							},
							$$slots: { default: true }
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		};

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			yNice: true,
			padding: 20,
			tooltipContext: { mode: 'quadtree-x' },
			height: 300,
			children,
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}