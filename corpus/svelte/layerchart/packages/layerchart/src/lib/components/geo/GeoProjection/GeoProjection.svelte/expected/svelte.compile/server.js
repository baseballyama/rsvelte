import * as $ from 'svelte/internal/server';
import { setGeoContext } from '$lib/contexts/geo.js';
import { getChartContext } from '$lib/contexts/chart.js';
import { GeoState } from '$lib/states/geo.svelte.js';

export default function GeoProjection($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, $$slots, $$events, ...props } = $$props;
		const ctx = getChartContext();

		// Create GeoState instance
		const geoState = new GeoState(() => props);

		// Sync chart dimensions to geo state
		setGeoContext(geoState);

		children($$renderer);
		$$renderer.push(`<!---->`);
	});
}