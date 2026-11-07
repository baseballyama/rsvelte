import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Area, Axis, Chart, Layer, LinearGradient } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Gradient_separate_stroke($$anchor, $$props) {
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

					Axis(node_1, { placement: 'bottom', rule: true });

					var node_2 = $.sibling(node_1, 2);

					{
						const children = ($$anchor, $$arg0) => {
							let strokeGradient = () => ($$arg0?.()).gradient;

							{
								const children = ($$anchor, $$arg0) => {
									let fillGradient = () => ($$arg0?.()).gradient;

									{
										let $0 = $.derived(() => ({ stroke: strokeGradient(), class: 'stroke-2' }));

										Area($$anchor, {
											get line() {
												return $.get($0);
											},

											get fill() {
												return fillGradient();
											}
										});
									}
								};

								LinearGradient($$anchor, {
									class: 'from-primary/50 to-primary/1',
									vertical: true,
									children,
									$$slots: { default: true }
								});
							}
						};

						LinearGradient(node_2, {
							class: 'from-secondary/1 to-secondary',
							children,
							$$slots: { default: true }
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	return $.pop($$exports);
}