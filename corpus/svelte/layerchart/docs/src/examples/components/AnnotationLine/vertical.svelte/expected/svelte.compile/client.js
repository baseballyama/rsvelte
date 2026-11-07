import 'svelte/internal/disclose-version';
import { getAppleStock } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { AnnotationLine, LineChart } from 'layerchart';

const data = await getAppleStock();

export default function Vertical($$anchor, $$props) {
	$.push($$props, true);

	var $$exports = { data };

	{
		const aboveMarks = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;

			AnnotationLine($$anchor, {
				x: new Date('2010-03-30'),
				label: 'Event',
				labelXOffset: 4,
				props: {
					line: { dashArray: [2, 2], stroke: 'var(--color-danger)' },
					label: { fill: 'var(--color-danger)' }
				}
			});
		};

		LineChart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			height: 300,
			padding: { top: 10, bottom: 20, left: 25 },
			aboveMarks,
			$$slots: { aboveMarks: true }
		});
	}

	return $.pop($$exports);
}