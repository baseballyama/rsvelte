import * as $ from 'svelte/internal/server';
import { BarChart } from 'layerchart';
import { getRandomInteger, usStateAbbreviations } from '$lib/utils/data.js';

export default function Brush_band($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = usStateAbbreviations.map((state) => ({ state, value: getRandomInteger(20, 100) }));

		BarChart($$renderer, { data, x: 'state', y: 'value', brush: true, height: 300 });
		$.bind_props($$props, { data });
	});
}