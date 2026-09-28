import * as $ from 'svelte/internal/server';
import { geoPath as d3GeoPath } from 'd3-geo';
import { createId } from '$lib/utils/createId.js';
import { getGeoContext } from '$lib/contexts/geo.js';

export default function GeoClipPath_base($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			ClipPath,
			id = createId('clipPath-', uid),
			geojson,
			disabled = false,
			invert = false,
			children
		} = $$props;

		const geo = getGeoContext();

		const path = $.derived(() => geo.projection && geojson
			? d3GeoPath(geo.projection)(geojson) ?? undefined
			: undefined);

		if (ClipPath) {
			$$renderer.push('<!--[-->');
			ClipPath($$renderer, { id, disabled, invert, children, path: path() });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}