import 'svelte/internal/disclose-version';
import { getAppleStock } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { AnnotationPoint, LineChart, defaultChartPadding } from 'layerchart';

const data = await getAppleStock();

export default function Series_annotation($$anchor, $$props) {
	$.push($$props, true);

	var $$exports = { data };

	{
		const aboveMarks = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			const lastPoint = $.derived(() => data[data.length - 1]);

			AnnotationPoint($$anchor, {
				get x() {
					return $.get(lastPoint).date;
				},

				get y() {
					return $.get(lastPoint).value;
				},
				label: 'Apple',
				labelPlacement: 'right',
				labelXOffset: 4,
				props: {
					circle: { class: 'fill-secondary' },
					label: { class: 'fill-secondary font-bold' }
				}
			});
		};

		let $0 = $.derived(() => defaultChartPadding({ right: 45, bottom: 15, left: 25 }));

		LineChart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			get padding() {
				return $.get($0);
			},
			height: 300,
			aboveMarks,
			$$slots: { aboveMarks: true }
		});
	}

	return $.pop($$exports);
}