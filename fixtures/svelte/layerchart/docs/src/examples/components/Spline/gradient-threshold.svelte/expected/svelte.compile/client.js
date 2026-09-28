import 'svelte/internal/disclose-version';
import { getDailyTemperature } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Layer, LinearGradient, Spline } from 'layerchart';

const data = await getDailyTemperature();
var root = $.from_html(`<!> <!> <!>`, 1);

export default function Gradient_threshold($$anchor, $$props) {
	$.push($$props, true);

	var $$exports = { data };

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			const thresholdOffset = $.derived(() => context().yScale(50) / context().containerHeight * 100 + '%');

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
							let gradient = () => ($$arg0?.()).gradient;

							Spline($$anchor, {
								class: 'stroke-2',
								get stroke() {
									return gradient();
								}
							});
						};

						let $0 = $.derived(() => [
							[$.get(thresholdOffset), 'var(--color-info)'],
							[$.get(thresholdOffset), 'var(--color-danger)']
						]);

						LinearGradient(node_2, {
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
			padding: { top: 25, left: 16, bottom: 25 },
			height: 300,
			children,
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}