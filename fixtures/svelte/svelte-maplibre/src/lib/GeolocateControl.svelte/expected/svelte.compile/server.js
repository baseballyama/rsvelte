import * as $ from 'svelte/internal/server';
import { getMapContext } from './context.svelte.js';
import * as maplibregl from 'maplibre-gl';
import { onDestroy } from 'svelte';

export default function GeolocateControl($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const $$d = $.derived(getMapContext),
			map = $.derived(() => $$d().map),
			loaded = $.derived(() => $$d().loaded);

		let {
			position = 'top-left',
			positionOptions = undefined,
			fitBoundsOptions = undefined,
			trackUserLocation = false,
			showAccuracyCircle = true,
			showUserLocation = true,
			control = void 0
		} = $$props;

		onDestroy(() => {
			if (loaded() && control) {
				map()?.removeControl(control);
			}
		});

		$.bind_props($$props, { control });
	});
}