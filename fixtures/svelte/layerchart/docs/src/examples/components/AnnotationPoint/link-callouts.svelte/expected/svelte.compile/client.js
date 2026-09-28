import 'svelte/internal/disclose-version';
import { getAppleStock } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { AnnotationPoint, LineChart } from 'layerchart';

const data = await getAppleStock();

export default function Link_callouts($$anchor, $$props) {
	$.push($$props, true);

	const annotations = [
		{
			x: new Date('June 29, 2007'),
			y: 121.89,
			r: 10,
			label: 'iPhone launches',
			labelPlacement: 'top',
			labelXOffset: 20,
			labelYOffset: 40,
			labelGap: 0,
			link: { type: 'beveled', radius: 15, sweep: 'vertical-horizontal' },
			props: {
				circle: { class: 'stroke-secondary fill-secondary/10' },
				label: { textAnchor: 'start', verticalAnchor: 'middle', dx: 4 }
			}
		},

		{
			x: new Date('April 3, 2010'),
			y: 232.39,
			r: 10,
			label: 'iPad debuts',
			labelPlacement: 'top-left',
			labelXOffset: 20,
			labelYOffset: 40,
			link: { type: 'swoop' },
			props: { circle: { class: 'stroke-secondary fill-secondary/10' } }
		},

		{
			x: new Date('March 7, 2012'),
			y: 545.18,
			r: 10,
			label: 'New iPad (3rd Gen)',
			labelPlacement: 'left',
			labelXOffset: 30,
			link: true,
			props: { circle: { class: 'stroke-secondary fill-secondary/10' } }
		}
	];

	var $$exports = { data };

	{
		const aboveMarks = ($$anchor) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.each(node, 17, () => annotations, $.index, ($$anchor, annotation) => {
				AnnotationPoint($$anchor, $.spread_props(() => $.get(annotation)));
			});

			$.append($$anchor, fragment_1);
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