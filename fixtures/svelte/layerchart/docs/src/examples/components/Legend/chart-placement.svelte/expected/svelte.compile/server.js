import * as $ from 'svelte/internal/server';
import { Chart, Legend } from 'layerchart';
import { scaleOrdinal } from 'd3-scale';

export default function Chart_placement($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		Chart($$renderer, {
			data: [{ name: 'One' }, { name: 'Two' }, { name: 'Three' }],
			c: 'name',
			cScale: scaleOrdinal(),
			cRange: [
				'var(--color-success)',
				'var(--color-warning)',
				'var(--color-danger)'
			],
			height: 200,
			children: ($$renderer) => {
				Legend($$renderer, {
					title: 'Top-Left',
					placement: 'top-left',
					variant: 'swatches'
				});

				$$renderer.push(`<!----> `);
				Legend($$renderer, { title: 'Top', placement: 'top', variant: 'swatches' });
				$$renderer.push(`<!----> `);

				Legend($$renderer, {
					title: 'Top-Right',
					placement: 'top-right',
					variant: 'swatches'
				});

				$$renderer.push(`<!----> `);
				Legend($$renderer, { title: 'Left', placement: 'left', variant: 'swatches' });
				$$renderer.push(`<!----> `);
				Legend($$renderer, { title: 'Center', placement: 'center', variant: 'swatches' });
				$$renderer.push(`<!----> `);
				Legend($$renderer, { title: 'Right', placement: 'right', variant: 'swatches' });
				$$renderer.push(`<!----> `);

				Legend($$renderer, {
					title: 'Bottom-Left',
					placement: 'bottom-left',
					variant: 'swatches'
				});

				$$renderer.push(`<!----> `);
				Legend($$renderer, { title: 'Bottom', placement: 'bottom', variant: 'swatches' });
				$$renderer.push(`<!----> `);

				Legend($$renderer, {
					title: 'Bottom-Right',
					placement: 'bottom-right',
					variant: 'swatches'
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	});
}