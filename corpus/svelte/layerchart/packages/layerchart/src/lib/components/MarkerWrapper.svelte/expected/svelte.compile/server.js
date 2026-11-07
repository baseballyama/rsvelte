import * as $ from 'svelte/internal/server';
import Marker from './Marker.svelte';

export default function MarkerWrapper($$renderer, $$props) {
	let { id, marker } = $$props;

	if (typeof marker === 'function') {
		$$renderer.push('<!--[0-->');
		marker($$renderer, { id });
		$$renderer.push(`<!---->`);
	} else if (marker) {
		$$renderer.push('<!--[1-->');

		Marker($$renderer, $.spread_props([
			{ id, type: typeof marker === 'string' ? marker : undefined },
			typeof marker === 'object' ? marker : null
		]));
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}