import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { flush } from '$lib/flush.js';
import { onDestroy } from 'svelte';
import { diffApplier } from './compare.js';
import { getId, getSource, getMapContext, updatedLayerContext } from './context.svelte.js';
import { combineFilters, isClusterFilter } from './filters.js';

export default function Layer($$anchor, $$props) {
	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => getId('layer')),
		source = $.prop($$props, 'source', 3, undefined),
		sourceLayer = $.prop($$props, 'sourceLayer', 3, undefined),
		beforeId = $.prop($$props, 'beforeId', 3, undefined),
		beforeLayerType = $.prop($$props, 'beforeLayerType', 3, undefined),
		paint = $.prop($$props, 'paint', 3, undefined),
		layout = $.prop($$props, 'layout', 3, undefined),
		filter = $.prop($$props, 'filter', 3, undefined),
		applyToClusters = $.prop($$props, 'applyToClusters', 3, undefined),
		requireSource = $.prop($$props, 'requireSource', 3, true),
		minzoom = $.prop($$props, 'minzoom', 3, undefined),
		maxzoom = $.prop($$props, 'maxzoom', 3, undefined),
		manageHoverState = $.prop($$props, 'manageHoverState', 3, false),
		hovered = $.prop($$props, 'hovered', 15),
		interactive = $.prop($$props, 'interactive', 3, true),
		hoverCursor = $.prop($$props, 'hoverCursor', 3, undefined),
		eventsIfTopMost = $.prop($$props, 'eventsIfTopMost', 3, false),
		children = $.prop($$props, 'children', 3, undefined),
		onclick = $.prop($$props, 'onclick', 3, undefined),
		ondblclick = $.prop($$props, 'ondblclick', 3, undefined),
		oncontextmenu = $.prop($$props, 'oncontextmenu', 3, undefined),
		onmouseenter = $.prop($$props, 'onmouseenter', 3, undefined),
		onmousemove = $.prop($$props, 'onmousemove', 3, undefined),
		onmouseleave = $.prop($$props, 'onmouseleave', 3, undefined);

	const sourceName = getSource();

	const $$d = $.derived(getMapContext),
		loaded = $.derived(() => $.get($$d).loaded);

	const { layer } = updatedLayerContext();

	const $$d_1 = $.derived(getMapContext),
		map = $.derived(() => $.get($$d_1).map),
		eventTopMost = $.derived(() => $.get($$d_1).eventTopMost),
		layerInfo = $.derived(() => $.get($$d_1).layerInfo),
		minzoomContext = $.derived(() => $.get($$d_1).minzoom),
		maxzoomContext = $.derived(() => $.get($$d_1).maxzoom);

	onDestroy(() => {
		if (layer.value && $.get(map)) {
			$.get(layerInfo).delete(layer.value);
			$.get(map).removeLayer(layer.value);
		}
	});

	let hoverFeatureId = undefined;

	function handleClick(e) {
		if (!interactive() || !layer.value || !$.get(map)) {
			return;
		}

		if (eventsIfTopMost() && $.get(eventTopMost)(e) !== layer.value) {
			return;
		}

		let features = e.features ?? [];
		let clusterId = features[0]?.properties?.cluster_id;

		let eventData = {
			event: e,
			map: $.get(map),
			clusterId,
			layer: layer.value,
			source: $.get(actualSource),
			features
		};

		switch (e.type) {
			case 'click':
				onclick()?.(eventData);
				break;

			case 'dblclick':
				ondblclick()?.(eventData);
				break;

			case 'contextmenu':
				oncontextmenu()?.(eventData);
				break;
		}
	}

	function handleMouseEnter(e) {
		if (!interactive() || !layer.value || !$.get(map)) {
			return;
		}

		if (eventsIfTopMost() && $.get(eventTopMost)(e) !== layer.value) {
			return;
		}

		if (hoverCursor()) {
			$.get(map).getCanvas().style.cursor = hoverCursor();
		}

		let features = e.features ?? [];

		hovered(features[0] ?? undefined);

		let clusterId = features[0]?.properties?.cluster_id;

		let data = {
			event: e,
			map: $.get(map),
			clusterId,
			layer: layer.value,
			source: $.get(actualSource),
			features
		};

		onmouseenter()?.(data);
	}

	function handleMouseMove(e) {
		if (!interactive() || !$.get(map)) {
			return;
		}

		if (eventsIfTopMost() && $.get(eventTopMost)(e) !== layer.value) {
			hovered(undefined);

			if (manageHoverState() && hoverFeatureId !== undefined) {
				$.get(map).setFeatureState(
					{
						source: $.get(actualSource),
						sourceLayer: sourceLayer(),
						id: hoverFeatureId
					},
					{ hover: false }
				);

				hoverFeatureId = undefined;
			}

			return;
		}

		// This may get out of sync, if this layer regains focus from a higher layer.
		if (hoverCursor()) {
			$.get(map).getCanvas().style.cursor = hoverCursor();
		}

		let features = e.features ?? [];
		let clusterId = features[0]?.properties?.cluster_id;
		let featureId = features[0]?.id;

		if (featureId !== hoverFeatureId) {
			if (manageHoverState()) {
				if (hoverFeatureId !== undefined) {
					$.get(map).setFeatureState(
						{
							source: $.get(actualSource),
							id: hoverFeatureId,
							sourceLayer: sourceLayer()
						},
						{ hover: false }
					);
				}

				$.get(map).setFeatureState(
					{
						source: $.get(actualSource),
						id: featureId,
						sourceLayer: sourceLayer()
					},
					{ hover: true }
				);
			}

			hoverFeatureId = featureId;
			hovered(features[0] ?? undefined);
		}

		onmousemove()?.({
			event: e,
			map: $.get(map),
			clusterId,
			layer: layer.value,
			source: $.get(actualSource),
			features
		});
	}

	function handleMouseLeave(e) {
		if (!interactive() || !layer.value || !$.get(map)) {
			return;
		}

		if (hoverCursor()) {
			$.get(map).getCanvas().style.cursor = '';
		}

		hovered(undefined);

		if (manageHoverState() && hoverFeatureId !== undefined) {
			const featureSelector = {
				source: $.get(actualSource),
				id: hoverFeatureId,
				sourceLayer: sourceLayer()
			};

			$.get(map).setFeatureState(featureSelector, { hover: false });
			hoverFeatureId = undefined;
		}

		onmouseleave()?.({
			map: $.get(map),
			layer: layer.value,
			source: $.get(actualSource)
		});
	}

	let first = $.state(true);

	function unsubEvents(layerName) {
		if (!$.get(map)) return;

		$.get(map).off('click', layerName, handleClick);
		$.get(map).off('dblclick', layerName, handleClick);
		$.get(map).off('contextmenu', layerName, handleClick);
		$.get(map).off('mouseenter', layerName, handleMouseEnter);
		$.get(map).off('mousemove', layerName, handleMouseMove);
		$.get(map).off('mouseleave', layerName, handleMouseLeave);
	}

	onDestroy(() => {
		if (layer.value) {
			unsubEvents(layer.value);
		}
	});

	let clusterFilter = $.derived(() => isClusterFilter(applyToClusters()));
	let layerFilter = $.derived(() => combineFilters('all', $.get(clusterFilter), filter()));
	let actualMinZoom = $.derived(() => minzoom() ?? $.get(minzoomContext));
	let actualMaxZoom = $.derived(() => maxzoom() ?? $.get(maxzoomContext));
	let actualSource = $.derived(() => source() || sourceName?.value);

	$.user_effect(() => {
		if ($.get(map) && layer.value !== id() && $.get(loaded) && ($.get(actualSource) || !requireSource())) {
			if (layer.value) {
				unsubEvents(layer.value);
				$.get(layerInfo).delete(layer.value);
			}

			let actualBeforeId = beforeId();

			if (!beforeId() && beforeLayerType()) {
				let layers = $.get(map).getStyle().layers;

				let layerFunc = typeof beforeLayerType() === 'function'
					? beforeLayerType()
					: (l) => l.type === beforeLayerType();

				let beforeLayer = layers?.find(layerFunc);

				if (beforeLayer) {
					actualBeforeId = beforeLayer.id;
				}
			}

			layer.value = id();

			$.get(map).addLayer(
				// @ts-expect-error Maplibre types try to match the `type` to the `paint` and `layout` but since
				// we're generic here it complains. That's ok.
				flush({
					id: layer.value,
					type: $$props.type,
					source: $.get(actualSource),
					'source-layer': sourceLayer(),
					filter: $.get(layerFilter),
					paint: paint(),
					layout: layout(),
					minzoom: $.get(actualMinZoom),
					maxzoom: $.get(actualMaxZoom)
				}),
				actualBeforeId
			);

			$.set(first, true);
			$.get(map).on('click', layer.value, handleClick);
			$.get(map).on('dblclick', layer.value, handleClick);
			$.get(map).on('contextmenu', layer.value, handleClick);
			$.get(map).on('mouseenter', layer.value, handleMouseEnter);
			$.get(map).on('mousemove', layer.value, handleMouseMove);
			$.get(map).on('mouseleave', layer.value, handleMouseLeave);
		}
	});

	$.user_effect(() => {
		if (layer.value) {
			$.get(layerInfo).set(layer.value, { interactive: interactive() });
		}
	});

	let applyPaint = $.derived(() => layer.value
		? diffApplier((key, value) => {
			if (!$.get(map)) return;

			if ($.get(map).style._loaded) {
				$.get(map).setPaintProperty(layer.value, key, value);
			} else {
				$.get(map).once('styledata', () => $.get(map).setPaintProperty(layer.value, key, value));
			}
		})
		: void 0);

	let applyLayout = $.derived(() => layer.value
		? diffApplier((key, value) => {
			if (!$.get(map)) return;

			if ($.get(map).style._loaded) {
				$.get(map).setLayoutProperty(layer.value, key, value);
			} else {
				$.get(map).once('styledata', () => $.get(map).setLayoutProperty(layer.value, key, value));
			}
		})
		: void 0);

	$.user_effect(() => {
		$.get(applyPaint)?.(paint());
	});

	$.user_effect(() => {
		$.get(applyLayout)?.(layout());
	});

	$.user_effect(() => {
		if (layer.value && $.get(map)) $.get(map).setLayerZoomRange(layer.value, $.get(actualMinZoom), $.get(actualMaxZoom));
	});

	// Don't set the filter again after we've just created it.
	$.user_effect(() => {
		if (layer.value && $.get(map)) {
			if ($.get(first)) {
				$.set(first, false);
			} else {
				$.get(map).setFilter(layer.value, $.get(layerFilter));
			}
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.key(node_1, () => layer.value, ($$anchor) => {
				var fragment_2 = $.comment();
				var node_2 = $.first_child(fragment_2);

				$.snippet(node_2, () => children() ?? $.noop);
				$.append($$anchor, fragment_2);
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (layer.value) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}