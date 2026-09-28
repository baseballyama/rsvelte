import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getMapContext } from './context.svelte.js';
import * as maplibregl from 'maplibre-gl';
import { onDestroy } from 'svelte';

export default function GeolocateControl($$anchor, $$props) {
	$.push($$props, true);

	const $$d = $.derived(getMapContext),
		map = $.derived(() => $.get($$d).map),
		loaded = $.derived(() => $.get($$d).loaded);

	let position = $.prop($$props, 'position', 3, 'top-left'),
		positionOptions = $.prop($$props, 'positionOptions', 3, undefined),
		fitBoundsOptions = $.prop($$props, 'fitBoundsOptions', 3, undefined),
		trackUserLocation = $.prop($$props, 'trackUserLocation', 3, false),
		showAccuracyCircle = $.prop($$props, 'showAccuracyCircle', 3, true),
		showUserLocation = $.prop($$props, 'showUserLocation', 3, true),
		control = $.prop($$props, 'control', 15);

	$.user_effect(() => {
		if ($.get(map) && !control()) {
			control(new maplibregl.GeolocateControl({
				positionOptions: positionOptions(),
				fitBoundsOptions: fitBoundsOptions(),
				trackUserLocation: trackUserLocation(),
				showAccuracyCircle: showAccuracyCircle(),
				showUserLocation: showUserLocation()
			}));

			$.get(map).addControl(control(), position());
		}
	});

	onDestroy(() => {
		if ($.get(loaded) && control()) {
			$.get(map)?.removeControl(control());
		}
	});

	$.pop();
}