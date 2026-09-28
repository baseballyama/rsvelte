import * as $ from 'svelte/internal/server';
import { LineChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Sparkline_within_a_paragraph($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ count: 50, min: 50, max: 100 });

		$$renderer.push(`<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam pretium, ligula ac sollicitudin
	ullamcorper, leo justo pretium tellus, at gravida ex quam et orci. `);

		LineChart($$renderer, {
			data,
			x: 'date',
			y: 'value',
			yDomain: null,
			axis: false,
			grid: false,
			props: {
				highlight: { points: { r: 3, class: 'stroke-2 stroke-surface-100' } }
			},
			height: 18,
			width: 124,
			class: 'inline-block'
		});

		$$renderer.push(`<!----> Sed ipsum justo, facilisis id tempor hendrerit, suscipit eu ipsum. Mauris ut sapien quis nibh volutpat
	venenatis. Ut viverra justo varius sapien convallis venenatis vel faucibus urna.</p>`);

		$.bind_props($$props, { data });
	});
}