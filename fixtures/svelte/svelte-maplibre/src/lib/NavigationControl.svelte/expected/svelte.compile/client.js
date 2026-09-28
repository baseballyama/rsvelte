import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getMapContext } from './context.svelte.js';
import * as maplibregl from 'maplibre-gl';
import { onDestroy } from 'svelte';

export default function NavigationControl($$anchor, $$props) {
	$.push($$props, true);

	const $$d = $.derived(getMapContext),
		map = $.derived(() => $.get($$d).map),
		loaded = $.derived(() => $.get($$d).loaded);

	let position = $.prop($$props, 'position', 3, 'top-left'),
		showCompass = $.prop($$props, 'showCompass', 3, true),
		showZoom = $.prop($$props, 'showZoom', 3, true),
		visualizePitch = $.prop($$props, 'visualizePitch', 3, false);

	let control = $.state(void 0);

	$.user_pre_effect(() => {
		if ($.get(map) && !$.get(control)) {
			$.set(
				control,
				new maplibregl.NavigationControl({
					showCompass: showCompass(),
					showZoom: showZoom(),
					visualizePitch: visualizePitch()
				}),
				true
			);

			$.get(map).addControl($.get(control), position());
		}
	});

	onDestroy(() => {
		if ($.get(loaded) && $.get(control)) {
			$.get(map)?.removeControl($.get(control));
		}
	});

	$.pop();
}