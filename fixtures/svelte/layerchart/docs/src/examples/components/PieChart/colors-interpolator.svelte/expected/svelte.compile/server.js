import * as $ from 'svelte/internal/server';
import { PieChart } from 'layerchart';
import { longData } from '$lib/utils/data';
import { quantize } from 'd3-interpolate';
import { interpolateRainbow } from 'd3-scale-chromatic';

export default function Colors_interpolator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = longData.filter((d) => d.year === 2019);

		PieChart($$renderer, {
			data,
			key: 'fruit',
			value: 'value',
			height: 300,
			cRange: quantize(interpolateRainbow, 5)
		});

		$.bind_props($$props, { data });
	});
}