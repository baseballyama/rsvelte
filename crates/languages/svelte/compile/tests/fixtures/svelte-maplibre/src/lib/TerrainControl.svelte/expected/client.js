import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getMapContext } from './context.svelte.js';
import * as maplibregl from 'maplibre-gl';
import { onDestroy } from 'svelte';

export default function TerrainControl($$anchor, $$props) {
	$.push($$props, true);

	const $$d = $.derived(getMapContext),
		map = $.derived(() => $.get($$d).map),
		loaded = $.derived(() => $.get($$d).loaded);

	let position = $.prop($$props, 'position', 3, 'top-left');
	let control = $.state(void 0);

	$.user_effect(() => {
		if ($.get(map) && !$.get(control)) {
			$.set(control, new maplibregl.TerrainControl({ source: $$props.source, exaggeration: $$props.exaggeration }), true);
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