import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LineChart, Spline, defaultChartPadding } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';
import { cls } from '@layerstack/tailwind';

export default function Series_with_nulls($$anchor, $$props) {
	$.push($$props, true);

	const keys = ['apples', 'bananas', 'oranges'];

	const data = createDateSeries({ count: 30, min: 10, max: 100, value: 'integer', keys }).map((d) => {
		const newItem = { ...d };

		keys.forEach((key) => {
			// @ts-expect-error shh
			newItem[key] = Math.random() < 0.2 ? null : newItem[key];
		});

		return newItem;
	});

	var $$exports = { data };

	{
		const belowMarks = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.each(node, 17, () => context().series.visibleSeries, $.index, ($$anchor, s) => {
				{
					let $0 = $.derived(() => data.filter((d) => d[$.get(s).key] !== null));
					let $1 = $.derived(() => cls('[stroke-dasharray:3,3] transition-opacity', context().series.highlightKey && context().series.highlightKey !== $.get(s).key && 'opacity-10'));

					Spline($$anchor, {
						get data() {
							return $.get($0);
						},

						get y() {
							return $.get(s).key;
						},

						get stroke() {
							return $.get(s).color;
						},

						get class() {
							return $.get($1);
						}
					});
				}
			});

			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(() => defaultChartPadding({ right: 10 }));

		LineChart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			series: [
				{ key: 'apples', color: 'var(--color-apples)' },
				{ key: 'bananas', color: 'var(--color-bananas)' },
				{ key: 'oranges', color: 'var(--color-oranges)' }
			],
			height: 300,
			get padding() {
				return $.get($0);
			},
			belowMarks,
			$$slots: { belowMarks: true }
		});
	}

	return $.pop($$exports);
}