import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onDestroy } from 'svelte';
import { getMapContext, setZoomLimits } from './context.svelte.js';

export default function ZoomRange($$anchor, $$props) {
	$.push($$props, true);

	/** If true, only instantiate the slot contents when the map zoom is in range. If false,
	 * the layers themselves will handle it. Usually you will want this to be false. */
	let minzoom = $.prop($$props, 'minzoom', 3, undefined),
		maxzoom = $.prop($$props, 'maxzoom', 3, undefined),
		enforce = $.prop($$props, 'enforce', 3, false);

	const $$d = $.derived(getMapContext),
		map = $.derived(() => $.get($$d).map),
		loaded = $.derived(() => $.get($$d).loaded);

	let zoomLimits = setZoomLimits(minzoom(), maxzoom());

	$.user_pre_effect(() => {
		zoomLimits.minzoomSetting = minzoom();
		zoomLimits.maxzoomSetting = maxzoom();
	});

	// svelte-ignore state_referenced_locally
	let zoom = $.state($.proxy($.get(map)?.getZoom() ?? 1));

	function handleZoom() {
		const currentZoom = $.get(map)?.getZoom();

		if (currentZoom) {
			$.set(zoom, currentZoom, true);
		}
	}

	$.user_effect(() => {
		$.get(map)?.on('zoom', handleZoom);
	});

	onDestroy(() => {
		if ($.get(loaded)) {
			$.get(map)?.off('zoom', handleZoom);
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.children ?? $.noop);
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (!enforce() || zoomLimits.minzoom <= $.get(zoom) && $.get(zoom) <= zoomLimits.maxzoom) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}