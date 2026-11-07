import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Area, Axis, Chart, Layer, LinearGradient, Rule } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Threshold_with_lineargradient_over_under($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({ count: 30, min: -20, max: 50, value: 'integer' });
	var $$exports = { data };

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			const thresholdValue = $.derived(() => 0);
			const thresholdOffset = $.derived(() => context().yScale($.get(thresholdValue)) / context().containerHeight);

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
						const children = ($$anchor, $$arg0) => {
							let gradient = () => ($$arg0?.()).gradient;

							{
								let $0 = $.derived(() => ({ stroke: gradient(), class: 'stroke-2' }));

								Area($$anchor, {
									y0: (d) => 0,
									get line() {
										return $.get($0);
									},

									get fill() {
										return gradient();
									},
									fillOpacity: 0.2
								});
							}
						};

						let $0 = $.derived(() => [
							[$.get(thresholdOffset), 'var(--color-success)'],
							[$.get(thresholdOffset), 'var(--color-danger)']
						]);

						LinearGradient(node_3, {
							get stops() {
								return $.get($0);
							},
							units: 'userSpaceOnUse',
							vertical: true,
							children,
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