import 'svelte/internal/disclose-version';
import { GeoState } from '$lib/states/geo.svelte.js';
import * as $ from 'svelte/internal/client';
import { setGeoContext } from '$lib/contexts/geo.js';
import { getChartContext } from '$lib/contexts/chart.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children']);

export default function GeoProjection($$anchor, $$props) {
	$.push($$props, true);

	let props = $.rest_props($$props, rest_excludes);
	const ctx = getChartContext();

	// Create GeoState instance
	const geoState = new GeoState(() => props);

	// Sync chart dimensions to geo state
	$.user_effect(() => {
		geoState.chartWidth = ctx.width;
		geoState.chartHeight = ctx.height;
	});

	setGeoContext(geoState);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children);
	$.append($$anchor, fragment);
	$.pop();
}