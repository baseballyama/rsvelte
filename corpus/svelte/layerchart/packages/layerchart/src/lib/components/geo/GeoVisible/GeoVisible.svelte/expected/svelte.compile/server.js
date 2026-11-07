import * as $ from 'svelte/internal/server';
import { isVisible } from '$lib/utils/geo.js';
import { getGeoContext } from '$lib/contexts/geo.js';

export default function GeoVisible($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { lat, long, children } = $$props;
		const geo = getGeoContext();

		if (geo.projection && isVisible(geo.projection)([long, lat])) {
			$$renderer.push('<!--[0-->');
			children?.($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}