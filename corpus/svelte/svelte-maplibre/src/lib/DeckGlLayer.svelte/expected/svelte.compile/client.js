import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, onDestroy } from 'svelte';

import {
	Box,
	getId,
	getMapContext,
	setPopupTarget,
	updatedDeckGlContext
} from './context.svelte.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'id',
	'interleaved',
	'minzoom',
	'maxzoom',
	'visible',
	'interactive',
	'hovered',
	'type',
	'data',
	'beforeId',
	'children',
	'onclick',
	'onmousemove',
	'onmouseleave'
]);

export default function DeckGlLayer($$anchor, $$props) {
	$.push($$props, true);

	/** Handle mouse events on this layer. */
	/** This indicates the currently hovered feature. Setting this attribute has no effect. */
	/** The deck.gl layer class to create */
	let id = $.prop($$props, 'id', 19, () => getId('deckgl-layer')),
		interleaved = $.prop($$props, 'interleaved', 3, false),
		minzoom = $.prop($$props, 'minzoom', 3, undefined),
		maxzoom = $.prop($$props, 'maxzoom', 3, undefined),
		visible = $.prop($$props, 'visible', 3, true),
		interactive = $.prop($$props, 'interactive', 3, true),
		hovered = $.prop($$props, 'hovered', 15),
		beforeId = $.prop($$props, 'beforeId', 3, undefined),
		onclick = $.prop($$props, 'onclick', 3, undefined),
		onmousemove = $.prop($$props, 'onmousemove', 3, undefined),
		onmouseleave = $.prop($$props, 'onmouseleave', 3, undefined),
		rest = $.rest_props($$props, rest_excludes);

	const context = getMapContext();

	const map = $.derived(() => context.map),
		loaded = $.derived(() => context.loaded),
		minZoomContext = $.derived(() => context.minzoom),
		maxZoomContext = $.derived(() => context.maxzoom);

	let deckgl = $.state(void 0);

	onMount(async () => {
		$.set(deckgl, await import('@deck.gl/mapbox'), true);
	});

	const { layer: layerId, layerEvent } = updatedDeckGlContext();

	layerId.value = id();
	setPopupTarget(new Box(undefined));

	let zoom = $.state($.proxy(context.map?.getZoom() ?? 1));

	function handleZoom() {
		const currentZoom = $.get(map)?.getZoom();

		if (currentZoom) {
			$.set(zoom, currentZoom, true);
		}
	}

	function handleClick(e) {
		if (!interactive()) {
			return;
		}

		onclick()?.(e);
		layerEvent.value = { ...e, layerType: 'deckgl', type: 'click' };
	}

	function handleHover(e) {
		if (!interactive()) {
			return;
		}

		const type = e.index !== -1 ? 'mousemove' : 'mouseleave';

		hovered(e.object ?? undefined);

		const handler = type === 'mousemove' ? onmousemove() : onmouseleave();

		handler?.(e);
		layerEvent.value = { ...e, layerType: 'deckgl', type };
	}

	let layer = $.state(void 0);

	onDestroy(() => {
		if ($.get(loaded) && $.get(layer) && $.get(map)) {
			$.get(map).removeControl($.get(layer));
			$.get(map).off('zoom', handleZoom);
			$.get(map).off('zoomend', handleZoom);
		}
	});

	$.user_effect(() => {
		layerId.value = id();
	});

	let actualMinZoom = $.derived(() => minzoom() ?? $.get(minZoomContext));
	let actualMaxZoom = $.derived(() => maxzoom() ?? $.get(maxZoomContext));
	let visibility = $.derived(() => visible() && $.get(zoom) >= $.get(actualMinZoom) && $.get(zoom) <= $.get(actualMaxZoom));

	let options = $.derived(() => ({
		...rest,
		beforeId: beforeId(),
		visible: $.get(visibility),
		data: $$props.data,
		pickable: interactive(),
		onClick: handleClick,
		onHover: handleHover
	}));

	$.user_effect(() => {
		if ($.get(loaded) && $.get(map) && $.get(deckgl) && !$.get(layer)) {
			$.get(map).on('zoom', handleZoom);
			$.get(map).on('zoomend', handleZoom);
			handleZoom();

			$.set(
				layer,
				new ($.get(deckgl).MapboxOverlay)({
					id: id(),
					interleaved: interleaved(),
					layers: [new $$props.type($.get(options))]
				}),
				true
			);

			$.get(map).addControl($.get(layer));
		}
	});

	$.user_effect(() => {
		$.get(layer)?.setProps({ layers: [new $$props.type($.get(options))] });
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
			if ($.get(layer)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}