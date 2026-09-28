import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Area, AreaChart, defaultChartPadding, LinearGradient } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Gradient($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });
	var $$exports = { data };

	{
		const marks = ($$anchor) => {
			{
				const children = ($$anchor, $$arg0) => {
					let gradient = () => ($$arg0?.()).gradient;

					Area($$anchor, {
						line: { class: 'stroke-primary' },
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
		};

		let $0 = $.derived(() => defaultChartPadding({ right: 10 }));

		AreaChart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			get padding() {
				return $.get($0);
			},
			height: 300,
			marks,
			$$slots: { marks: true }
		});
	}

	return $.pop($$exports);
}