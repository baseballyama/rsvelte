import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Area,
	Axis,
	Chart,
	Layer,
	LinearGradient,
	asAny,
	chartDataArray,
	defaultChartPadding
} from 'layerchart';

import { stack } from 'd3-shape';
import flatten from '$lib/utils/flatten.js';
import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<!> <!>  <!>`, 1);

export default function Stack_with_gradient($$anchor, $$props) {
	$.push($$props, true);

	const keys = ['apples', 'bananas', 'oranges'];
	const multiSeriesData = createDateSeries({ count: 30, min: 10, max: 100, value: 'integer', keys });
	const stackData = stack().keys(keys)(multiSeriesData);
	var $$exports = { data: stackData };

	{
		let $0 = $.derived(() => flatten(stackData));
		let $1 = $.derived(() => defaultChartPadding({ left: 25, bottom: 20 }));

		Chart($$anchor, {
			get data() {
				return stackData;
			},

			get flatData() {
				return $.get($0);
			},
			x: (d) => asAny(d).data.date,
			y: [0, 1],
			yNice: true,
			get padding() {
				return $.get($1);
			},
			height: 300,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						const primaryColors = $.derived(() => [
							'var(--color-apples)',
							'var(--color-bananas)',
							'var(--color-oranges)'
						]);

						const secondaryColors = $.derived(() => [
							'color-mix(in lch, var(--color-apples) 10%, transparent)',
							'color-mix(in lch, var(--color-bananas) 10%, transparent)',
							'color-mix(in lch, var(--color-oranges) 10%, transparent)'
						]);

						var fragment_2 = root();
						var node = $.first_child(fragment_2);

						Axis(node, { placement: 'left', grid: true, rule: true });

						var node_1 = $.sibling(node, 2);

						Axis(node_1, { placement: 'bottom', rule: true });

						var node_2 = $.sibling(node_1, 2);

						$.each(node_2, 17, () => chartDataArray(stackData), $.index, ($$anchor, seriesData, index) => {
							const primaryColor = $.derived(() => $.get(primaryColors)[index]);
							const secondaryColor = $.derived(() => $.get(secondaryColors)[index]);

							{
								const children = ($$anchor, $$arg0) => {
									let gradient = () => ($$arg0?.()).gradient;

									{
										let $0 = $.derived(() => ({ stroke: $.get(primaryColor) }));

										Area($$anchor, {
											get data() {
												return $.get(seriesData);
											},

											get fill() {
												return gradient();
											},
											fillOpacity: 0.5,
											get line() {
												return $.get($0);
											}
										});
									}
								};

								let $0 = $.derived(() => [$.get(primaryColor), $.get(secondaryColor)]);

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