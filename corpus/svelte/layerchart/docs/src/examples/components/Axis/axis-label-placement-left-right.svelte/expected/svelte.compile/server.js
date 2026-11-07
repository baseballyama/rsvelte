import * as $ from 'svelte/internal/server';
import { Axis, Chart, Layer } from 'layerchart';

export default function Axis_label_placement_left_right($$renderer) {
	Chart($$renderer, {
		yDomain: [0, 100],
		padding: { top: 24, bottom: 24, left: 40, right: 40 },
		height: 300,
		children: ($$renderer) => {
			Layer($$renderer, {
				children: ($$renderer) => {
					Axis($$renderer, {
						label: 'left start',
						placement: 'left',
						labelPlacement: 'start',
						rule: true
					});

					$$renderer.push(`<!----> `);

					Axis($$renderer, {
						label: 'left middle',
						placement: 'left',
						labelPlacement: 'middle',
						rule: true
					});

					$$renderer.push(`<!----> `);

					Axis($$renderer, {
						label: 'left end',
						placement: 'left',
						labelPlacement: 'end',
						rule: true
					});

					$$renderer.push(`<!----> `);

					Axis($$renderer, {
						label: 'right start',
						placement: 'right',
						labelPlacement: 'start',
						rule: true
					});

					$$renderer.push(`<!----> `);

					Axis($$renderer, {
						label: 'right middle',
						placement: 'right',
						labelPlacement: 'middle',
						rule: true
					});

					$$renderer.push(`<!----> `);

					Axis($$renderer, {
						label: 'right end',
						placement: 'right',
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
}