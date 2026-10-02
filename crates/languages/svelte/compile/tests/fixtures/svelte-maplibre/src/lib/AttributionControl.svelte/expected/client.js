import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getMapContext } from './context.svelte.js';
import * as maplibregl from 'maplibre-gl';
import { onDestroy } from 'svelte';

export default function AttributionControl($$anchor, $$props) {
	$.push($$props, true);

	const $$d = $.derived(getMapContext),
		map = $.derived(() => $.get($$d).map),
		loaded = $.derived(() => $.get($$d).loaded);

	let position = $.prop($$props, 'position', 3, 'bottom-right'),
		compact = $.prop($$props, 'compact', 3, false),
		customAttribution = $.prop($$props, 'customAttribution', 3, undefined);

	let control = $.state(void 0);

	$.user_effect(() => {
		if ($.get(map) && !$.get(control)) {
			$.set(control, new maplibregl.AttributionControl({ compact: compact(), customAttribution: customAttribution() }), true);
			$.get(map).addControl($.get(control), position());
		}
	});

	onDestroy(() => {
		if ($.get(loaded) && $.get(control) && $.get(map)) {
			$.get(map).removeControl($.get(control));
		}
	});

	$.pop();
}