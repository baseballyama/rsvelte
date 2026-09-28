import * as $ from 'svelte/internal/server';
import { onMount, onDestroy } from 'svelte';

import {
	Box,
	getId,
	getMapContext,
	setPopupTarget,
	updatedDeckGlContext
} from './context.svelte.js';

export default function DeckGlLayer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** Handle mouse events on this layer. */
		/** This indicates the currently hovered feature. Setting this attribute has no effect. */
		/** The deck.gl layer class to create */
		let {
			id = getId('deckgl-layer'),
			interleaved = false,
			minzoom = undefined,
			maxzoom = undefined,
			visible = true,
			interactive = true,
			hovered = void 0,
			type,
			data,
			beforeId = undefined,
			children,
			onclick = undefined,
			onmousemove = undefined,
			onmouseleave = undefined,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const context = getMapContext();

		const map = $.derived(() => context.map),
			loaded = $.derived(() => context.loaded),
			minZoomContext = $.derived(() => context.minzoom),
			maxZoomContext = $.derived(() => context.maxzoom);

		let deckgl = void 0;

		onMount(async () => {
			deckgl = await import('@deck.gl/mapbox');
		});

		const { layer: layerId, layerEvent } = updatedDeckGlContext();

		layerId.value = id;
		setPopupTarget(new Box(undefined));

		let zoom = context.map?.getZoom() ?? 1;

		function handleZoom() {
			const currentZoom = map()?.getZoom();

			if (currentZoom) {
				zoom = currentZoom;
			}
		}

		function handleClick(e) {
			if (!interactive) {
				return;
			}

			onclick?.(e);
			layerEvent.value = { ...e, layerType: 'deckgl', type: 'click' };
		}

		function handleHover(e) {
			if (!interactive) {
				return;
			}

			const type = e.index !== -1 ? 'mousemove' : 'mouseleave';

			hovered = e.object ?? undefined;

			const handler = type === 'mousemove' ? onmousemove : onmouseleave;

			handler?.(e);
			layerEvent.value = { ...e, layerType: 'deckgl', type };
		}

		let layer = void 0;

		onDestroy(() => {
			if (loaded() && layer && map()) {
				map().removeControl(layer);
				map().off('zoom', handleZoom);
				map().off('zoomend', handleZoom);
			}
		});

		let actualMinZoom = $.derived(() => minzoom ?? minZoomContext());
		let actualMaxZoom = $.derived(() => maxzoom ?? maxZoomContext());
		let visibility = $.derived(() => visible && zoom >= actualMinZoom() && zoom <= actualMaxZoom());

		let options = $.derived(() => ({
			...rest,
			beforeId,
			visible: visibility(),
			data,
			pickable: interactive,
			onClick: handleClick,
			onHover: handleHover
		}));

		if (layer) {
			$$renderer.push('<!--[0-->');
			children?.($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { hovered });
	});
}