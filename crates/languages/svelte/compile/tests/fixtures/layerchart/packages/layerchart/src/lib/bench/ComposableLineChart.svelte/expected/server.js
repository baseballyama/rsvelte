import * as $ from 'svelte/internal/server';
import Chart from '../components/Chart/Chart.svelte';
import Layer from '../components/layers/Layer.svelte';
import Axis from '../components/Axis/Axis.svelte';
import Spline from '../components/Spline/Spline.svelte';
import Highlight from '../components/Highlight/Highlight.svelte';

export default function ComposableLineChart($$renderer, $$props) {
	let {
		data,
		x,
		y,
		width,
		height,
		xDomain,
		yDomain,
		series,
		layer = 'svg',
		axis = false,
		highlight = false
	} = $$props;

	Chart($$renderer, {
		data,
		x,
		y,
		width,
		height,
		series,
		xDomain,
		yDomain,
		children: ($$renderer) => {
			Layer($$renderer, {
				type: layer,
				children: ($$renderer) => {
					if (axis) {
						$$renderer.push('<!--[0-->');
						Axis($$renderer, { placement: 'left' });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'bottom' });
						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (series) {
						$$renderer.push(`<!--[0--><!--[-->`);

						const each_array = $.ensure_array_like(series);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let s = each_array[$$index];

							Spline($$renderer, { seriesKey: s.key });
						}

						$$renderer.push(`<!--]-->`);
					} else {
						$$renderer.push('<!--[-1-->');
						Spline($$renderer, {});
					}

					$$renderer.push(`<!--]--> `);

					if (highlight) {
						$$renderer.push('<!--[0-->');
						Highlight($$renderer, {});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}