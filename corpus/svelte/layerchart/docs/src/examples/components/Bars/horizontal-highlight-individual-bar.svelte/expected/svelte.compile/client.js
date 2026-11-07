import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scaleBand } from 'd3-scale';
import { Bars, Axis, Chart, Highlight, Layer, Pattern } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Horizontal_highlight_individual_bar($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({
		count: 10,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});

	var $$exports = { data };

	{
		let $0 = $.derived(() => scaleBand().padding(0.4));

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: 'value',
			xDomain: [0, null],
			xNice: true,
			y: 'date',
			get yScale() {
				return $.get($0);
			},
			padding: { left: 32, bottom: 20, right: 8 },
			height: 300,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node = $.first_child(fragment_2);

						Axis(node, { placement: 'bottom', grid: true, rule: true });

						var node_1 = $.sibling(node, 2);

						Axis(node_1, { placement: 'left', rule: true });

						var node_2 = $.sibling(node_1, 2);

						{
							const children = ($$anchor, $$arg0) => {
								let pattern = () => ($$arg0?.()).pattern;

								{
									let $0 = $.derived(() => ({ fill: pattern(), class: 'stroke-secondary/50' }));

									Highlight($$anchor, {
										get data() {
											return data[3];
										},

										get area() {
											return $.get($0);
										}
									});
								}
							};

							Pattern(node_2, {
								size: 8,
								lines: { rotate: -45, color: 'var(--color-secondary)', opacity: 0.3 },
								background: 'color-mix(in oklab, var(--color-secondary) 10%, transparent)',
								children,
								$$slots: { default: true }
							});
						}

						var node_3 = $.sibling(node_2, 2);

						Bars(node_3, { strokeWidth: 1, class: 'fill-primary' });
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