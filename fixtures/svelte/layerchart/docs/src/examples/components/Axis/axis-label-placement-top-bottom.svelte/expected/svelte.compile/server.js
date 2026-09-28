import * as $ from 'svelte/internal/server';
import { Axis, Chart, Layer } from 'layerchart';
import { timeDay } from 'd3-time';
import { startOfInterval } from '@layerstack/utils';

export default function Axis_label_placement_top_bottom($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const today = startOfInterval('day', new Date());

		Chart($$renderer, {
			xDomain: [timeDay.offset(today, -10), today],
			padding: { top: 40, bottom: 40, left: 24, right: 24 },
			height: 200,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, {
							label: 'top start',
							placement: 'top',
							labelPlacement: 'start',
							rule: true
						});

						$$renderer.push(`<!----> `);

						Axis($$renderer, {
							label: 'top middle',
							placement: 'top',
							labelPlacement: 'middle',
							rule: true
						});

						$$renderer.push(`<!----> `);

						Axis($$renderer, {
							label: 'top end',
							placement: 'top',
							labelPlacement: 'end',
							rule: true
						});

						$$renderer.push(`<!----> `);

						Axis($$renderer, {
							label: 'bottom start',
							placement: 'bottom',
							labelPlacement: 'start',
							rule: true
						});

						$$renderer.push(`<!----> `);

						Axis($$renderer, {
							label: 'bottom middle',
							placement: 'bottom',
							labelPlacement: 'middle',
							rule: true
						});

						$$renderer.push(`<!----> `);

						Axis($$renderer, {
							label: 'bottom end',
							placement: 'bottom',
							labelPlacement: 'end',
							rule: true
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});
}