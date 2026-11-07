import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Area, AreaChart, defaultChartPadding, LinearGradient } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Series_stack_gradient($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({
		count: 30,
		min: 10,
		max: 100,
		value: 'integer',
		keys: ['apples', 'bananas', 'oranges']
	});

	var $$exports = { data };

	{
		const marks = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.each(node, 19, () => context().series.series, (s) => s.key, ($$anchor, s) => {
				{
					const children = ($$anchor, $$arg0) => {
						let gradient = () => ($$arg0?.()).gradient;

						{
							let $0 = $.derived(() => ({ stroke: $.get(s).color }));

							Area($$anchor, {
								get seriesKey() {
									return $.get(s).key;
								},

								get line() {
									return $.get($0);
								},

								get fill() {
									return gradient();
								},
								fillOpacity: 0.3
							});
						}
					};

					let $0 = $.derived(() => $.get(s).color
						? [
							$.get(s).color,
							'color-mix(in lch, ' + $.get(s).color + ' 10%, transparent)'
						]
						: undefined);

					LinearGradient($$anchor, {
						get stops() {
							return $.get($0);
						},
						vertical: true,
						children,
						$$slots: { default: true }
					});
				}
			});

			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(() => defaultChartPadding({ right: 10 }));

		AreaChart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			series: [
				{ key: 'apples', color: 'var(--color-apples)' },
				{ key: 'bananas', color: 'var(--color-bananas)' },
				{ key: 'oranges', color: 'var(--color-oranges)' }
			],

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