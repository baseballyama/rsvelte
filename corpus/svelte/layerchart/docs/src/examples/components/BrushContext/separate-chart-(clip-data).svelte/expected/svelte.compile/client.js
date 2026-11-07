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
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Separate_chart__clip_data_($$anchor, $$props) {
	$.push($$props, true);

	let xDomain = $.state($.proxy([null, null]));
	var $$exports = { data };
	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => defaultChartPadding({ left: 25, bottom: 24 }));

		Chart(node, {
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
			height: 300,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						Axis(node_1, { placement: 'left', grid: true, rule: true });

						var node_2 = $.sibling(node_1, 2);

						Axis(node_2, { placement: 'bottom', rule: true });

						var node_3 = $.sibling(node_2, 2);

						ChartClipPath(node_3, {
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

	var node_4 = $.sibling(node, 2);

	Chart(node_4, {
		get data() {
			return data;
		},
		x: 'date',
		y: 'value',
		padding: { left: 16 },
		brush: {
			onChange: (e) => {
				$.set(xDomain, e.brush.x, true);
			}
		},
		height: 40,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					Area($$anchor, {
						line: { class: 'stroke-2 stroke-primary' },
						class: 'fill-primary/20'
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);

	return $.pop($$exports);
}