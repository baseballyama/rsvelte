import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Area, Axis, Chart, Layer, Text } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Explicit_axis_ticks_min_max($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });
	var $$exports = { data };

	Chart($$anchor, {
		get data() {
			return data;
		},
		x: 'date',
		y: 'value',
		yDomain: [0, null],
		yNice: true,
		padding: 20,
		height: 300,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					Axis(node, { placement: 'left', grid: true, rule: true });

					var node_1 = $.sibling(node, 2);

					{
						const tickLabel = ($$anchor, $$arg0) => {
							let props = () => ($$arg0?.()).props;
							let index = () => ($$arg0?.()).index;

							{
								let $0 = $.derived(() => index() ? 'end' : 'start');

								Text($$anchor, $.spread_props(props, {
									get textAnchor() {
										return $.get($0);
									}
								}));
							}
						};

						Axis(node_1, {
							placement: 'bottom',
							format: 'day',
							rule: true,
							ticks: (scale) => scale.domain(),
							tickLabel,
							$$slots: { tickLabel: true }
						});
					}

					var node_2 = $.sibling(node_1, 2);

					Area(node_2, {
						line: { class: 'stroke-2 stroke-primary' },
						class: 'fill-primary/30'
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	return $.pop($$exports);
}