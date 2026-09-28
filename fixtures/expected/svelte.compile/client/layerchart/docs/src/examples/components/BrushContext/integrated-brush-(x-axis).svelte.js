import 'svelte/internal/disclose-version';
import { getAppleStock } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';

import {
	Area,
	Axis,
	Chart,
	ChartClipPath,
	Layer,
	LinearGradient,
	defaultChartPadding
} from 'layerchart';

const data = await getAppleStock();
var root = $.from_html(`<!> <!> <!>`, 1);

export default function Integrated_brush__x_axis_($$anchor, $$props) {
	$.push($$props, true);

	let xDomain = $.state($.proxy([null, null]));
	var $$exports = { data };

	{
		let $0 = $.derived(() => defaultChartPadding({ left: 25, bottom: 24 }));

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			get xDomain() {
				return $.get(xDomain);
			},
			y: 'value',
			yDomain: [0, null],
			get padding() {
				return $.get($0);
			},

			brush: {
				onBrushEnd: (e) => {
					$.set(xDomain, e.brush.x, true);
					e.brush.reset();
				}
			},
			height: 300,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node = $.first_child(fragment_2);

						Axis(node, { placement: 'left', grid: true, rule: true });

						var node_1 = $.sibling(node, 2);

						Axis(node_1, { placement: 'bottom', rule: true });

						var node_2 = $.sibling(node_1, 2);

						ChartClipPath(node_2, {
							children: ($$anchor, $$slotProps) => {
								{
									const children = ($$anchor, $$arg0) => {
										let gradient = () => ($$arg0?.()).gradient;

										Area($$anchor, {
											line: { class: 'stroke-2 stroke-primary' },
											get fill() {
												return gradient();
											}
										});
									};

									LinearGradient($$anchor, {
										class: 'from-primary/50 to-primary/1',
										vertical: true,
										children,
										$$slots: { default: true }
									});
								}
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}