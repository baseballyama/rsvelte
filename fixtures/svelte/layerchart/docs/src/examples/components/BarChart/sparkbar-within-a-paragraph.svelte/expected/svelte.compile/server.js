import * as $ from 'svelte/internal/server';
import { BarChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Sparkbar_within_a_paragraph($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ count: 30, min: 20, max: 100 });

		$$renderer.push(`<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam pretium, ligula ac sollicitudin
	ullamcorper, leo justo pretium tellus, at gravida ex quam et orci. `);

		BarChart($$renderer, {
			data,
			x: 'date',
			y: 'value',
			axis: false,
			grid: false,
			bandPadding: 0.1,
			props: { bars: { radius: 1, strokeWidth: 0 } },
			height: 18,
			width: 124,
			class: 'inline-block'
		});

		$$renderer.push(`<!----> Sed ipsum justo, facilisis id tempor hendrerit, suscipit eu ipsum. Mauris ut sapien quis nibh volutpat
	venenatis. Ut viverra justo varius sapien convallis venenatis vel faucibus urna.</p>`);

		$.bind_props($$props, { data });
	});
}