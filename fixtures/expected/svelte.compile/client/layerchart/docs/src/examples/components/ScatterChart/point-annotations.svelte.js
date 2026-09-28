import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ScatterChart } from 'layerchart';
import { getSpiral } from '$lib/utils/data.js';

export default function Point_annotations($$anchor, $$props) {
	$.push($$props, true);

	const data = getSpiral({
		angle: 137.5,
		radius: 10,
		count: 100,
		width: 500,
		height: 500
	});

	var $$exports = { data };

	{
		let $0 = $.derived(() => [
			{
				type: 'point',
				layer: 'below',
				label: 'First point',
				labelPlacement: 'top',
				labelYOffset: 4,
				x: data[0].x,
				y: data[0].y,
				r: 10,
				props: {
					circle: { class: 'stroke-secondary fill-secondary/10' },
					label: { class: 'fill-secondary text-xs' }
				}
			},

			{
				type: 'point',
				layer: 'below',
				label: 'Last point',
				labelPlacement: 'top',
				labelYOffset: 4,
				x: data[data.length - 1].x,
				y: data[data.length - 1].y,
				r: 10,
				props: {
					circle: { class: 'stroke-secondary fill-secondary/10' },
					label: { class: 'fill-secondary text-xs' }
				}
			}
		]);

		ScatterChart($$anchor, {
			get data() {
				return data;
			},
			xNice: true,
			x: 'x',
			y: 'y',
			get annotations() {
				return $.get($0);
			},
			padding: 24,
			height: 400
		});
	}

	return $.pop($$exports);
}