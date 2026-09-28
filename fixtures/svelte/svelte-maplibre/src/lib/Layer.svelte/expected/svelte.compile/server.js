import * as $ from 'svelte/internal/server';
import { flush } from '$lib/flush.js';
import { onDestroy } from 'svelte';
import { diffApplier } from './compare.js';
import { getId, getSource, getMapContext, updatedLayerContext } from './context.svelte.js';
import { combineFilters, isClusterFilter } from './filters.js';

export default function Layer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			id = getId('layer'),
			source = undefined,
			sourceLayer = undefined,
			beforeId = undefined,
			beforeLayerType = undefined,
			type,
			paint = undefined,
			layout = undefined,
			filter = undefined,
			applyToClusters = undefined,
			requireSource = true,
			minzoom = undefined,
			maxzoom = undefined,
			manageHoverState = false,
			hovered = void 0,
			interactive = true,
			hoverCursor = undefined,
			eventsIfTopMost = false,
			children = undefined,
			onclick = undefined,
			ondblclick = undefined,
			oncontextmenu = undefined,
			onmouseenter = undefined,
			onmousemove = undefined,
			onmouseleave = undefined
		} = $$props;

		const sourceName = getSource();

		const $$d = $.derived(getMapContext),
			loaded = $.derived(() => $$d().loaded);

		const { layer } = updatedLayerContext();

		const $$d_1 = $.derived(getMapContext),
			map = $.derived(() => $$d_1().map),
			eventTopMost = $.derived(() => $$d_1().eventTopMost),
			layerInfo = $.derived(() => $$d_1().layerInfo),
			minzoomContext = $.derived(() => $$d_1().minzoom),
			maxzoomContext = $.derived(() => $$d_1().maxzoom);

		onDestroy(() => {
			if (layer.value && map()) {
				layerInfo().delete(layer.value);
				map().removeLayer(layer.value);
			}
		});

		let hoverFeatureId = undefined;

		function handleClick(e) {
			if (!interactive || !layer.value || !map()) {
				return;
			}

			if (eventsIfTopMost && eventTopMost()(e) !== layer.value) {
				return;
			}

			let features = e.features ?? [];
			let clusterId = features[0]?.properties?.cluster_id;

			let eventData = {
				event: e,
				map: map(),
				clusterId,
				layer: layer.value,
				source: actualSource(),
				features
			};

			switch (e.type) {
				case 'click':
					onclick?.(eventData);
					break;

				case 'dblclick':
					ondblclick?.(eventData);
					break;

				case 'contextmenu':
					oncontextmenu?.(eventData);
					break;
			}
		}

		function handleMouseEnter(e) {
			if (!interactive || !layer.value || !map()) {
				return;
			}

			if (eventsIfTopMost && eventTopMost()(e) !== layer.value) {
				return;
			}

			if (hoverCursor) {
				map().getCanvas().style.cursor = hoverCursor;
			}

			let features = e.features ?? [];

			hovered = features[0] ?? undefined;

			let clusterId = features[0]?.properties?.cluster_id;

			let data = {
				event: e,
				map: map(),
				clusterId,
				layer: layer.value,
				source: actualSource(),
				features
			};

			onmouseenter?.(data);
		}

		function handleMouseMove(e) {
			if (!interactive || !map()) {
				return;
			}

			if (eventsIfTopMost && eventTopMost()(e) !== layer.value) {
				hovered = undefined;

				if (manageHoverState && hoverFeatureId !== undefined) {
					map().setFeatureState({ source: actualSource(), sourceLayer, id: hoverFeatureId }, { hover: false });
					hoverFeatureId = undefined;
				}

				return;
			}

			// This may get out of sync, if this layer regains focus from a higher layer.
			if (hoverCursor) {
				map().getCanvas().style.cursor = hoverCursor;
			}

			let features = e.features ?? [];
			let clusterId = features[0]?.properties?.cluster_id;
			let featureId = features[0]?.id;

			if (featureId !== hoverFeatureId) {
				if (manageHoverState) {
					if (hoverFeatureId !== undefined) {
						map().setFeatureState({ source: actualSource(), id: hoverFeatureId, sourceLayer }, { hover: false });
					}

					map().setFeatureState({ source: actualSource(), id: featureId, sourceLayer }, { hover: true });
				}

				hoverFeatureId = featureId;
				hovered = features[0] ?? undefined;
			}

			onmousemove?.({
				event: e,
				map: map(),
				clusterId,
				layer: layer.value,
				source: actualSource(),
				features
			});
		}

		function handleMouseLeave(e) {
			if (!interactive || !layer.value || !map()) {
				return;
			}

			if (hoverCursor) {
				map().getCanvas().style.cursor = '';
			}

			hovered = undefined;

			if (manageHoverState && hoverFeatureId !== undefined) {
				const featureSelector = { source: actualSource(), id: hoverFeatureId, sourceLayer };

				map().setFeatureState(featureSelector, { hover: false });
				hoverFeatureId = undefined;
			}

			onmouseleave?.({ map: map(), layer: layer.value, source: actualSource() });
		}

		let first = true;

		function unsubEvents(layerName) {
			if (!map()) return;

			map().off('click', layerName, handleClick);
			map().off('dblclick', layerName, handleClick);
			map().off('contextmenu', layerName, handleClick);
			map().off('mouseenter', layerName, handleMouseEnter);
			map().off('mousemove', layerName, handleMouseMove);
			map().off('mouseleave', layerName, handleMouseLeave);
		}

		onDestroy(() => {
			if (layer.value) {
				unsubEvents(layer.value);
			}
		});

		let clusterFilter = $.derived(() => isClusterFilter(applyToClusters));
		let layerFilter = $.derived(() => combineFilters('all', clusterFilter(), filter));
		let actualMinZoom = $.derived(() => minzoom ?? minzoomContext());
		let actualMaxZoom = $.derived(() => maxzoom ?? maxzoomContext());
		let actualSource = $.derived(() => source || sourceName?.value);

		// @ts-expect-error Maplibre types try to match the `type` to the `paint` and `layout` but since
		// we're generic here it complains. That's ok.
		let applyPaint = $.derived(() => layer.value
			? diffApplier((key, value) => {
				if (!map()) return;

				if (map().style._loaded) {
					map().setPaintProperty(layer.value, key, value);
				} else {
					map().once('styledata', () => map().setPaintProperty(layer.value, key, value));
				}
			})
			: void 0);

		let applyLayout = $.derived(() => layer.value
			? diffApplier((key, value) => {
				if (!map()) return;

				if (map().style._loaded) {
					map().setLayoutProperty(layer.value, key, value);
				} else {
					map().once('styledata', () => map().setLayoutProperty(layer.value, key, value));
				}
			})
			: void 0);

		if (// Don't set the filter again after we've just created it.
		layer.value) {
			$$renderer.push(`<!--[0--><!---->`);

			{
				children?.($$renderer);
				$$renderer.push(`<!---->`);
			}

			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { hovered });
	});
}