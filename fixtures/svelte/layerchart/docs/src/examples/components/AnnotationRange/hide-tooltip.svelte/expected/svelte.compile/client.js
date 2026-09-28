import 'svelte/internal/disclose-version';
import { getAppleStock } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { AnnotationRange, LineChart, defaultChartPadding } from 'layerchart';

const data = await getAppleStock();

export default function Hide_tooltip($$anchor, $$props) {
	$.push($$props, true);

	var $$exports = { data };

	{
		const aboveMarks = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;

			AnnotationRange($$anchor, {
				x: [new Date('2010-01-01'), null],
				pattern: { size: 8, lines: { rotate: -45, opacity: 0.2 } },
				props: {
					rect: {
						onpointermove: (e) => {
							e.stopPropagation();
							context().tooltip.hide();
						}
					}
				}
			});
		};

		let $0 = $.derived(() => defaultChartPadding({ left: 25, bottom: 15 }));

		LineChart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			height: 300,
			get padding() {
				return $.get($0);
			},
			aboveMarks,
			$$slots: { aboveMarks: true }
		});
	}

	return $.pop($$exports);
}