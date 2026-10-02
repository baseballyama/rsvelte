import * as $ from 'svelte/internal/server';
import * as maplibregl from 'maplibre-gl';
import { onDestroy, onMount } from 'svelte';

import {
	getMapContext,
	isDeckGlMouseEvent,
	getLayer,
	getLayerEvent,
	getPopupTarget,
	getLngLatContext
} from './context.svelte.js';

export default function Popup($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** Show the built-in close button. By default the close button will be shown
		 * only if closeOnClickOutside and closeOnClickInside are not set. */
		/** Close on click outside the popup. */
		/** Close on click inside the popup. This should only be used for non-interactive popups. */
		/** Close the popup when the map moves. */
		/** Define when to open the popup. If set to manual, you can open the popup programmatically by
		 * setting the `open` attribute. */
		/** Only open the popup if there's no feature from a higher layer covering this one. */
		/** Classes to apply to the map's popup container */
		/** Where to show the popup. */
		/** If set and the slot is omitted, use this string as HTML to pass into the popup. */
		/** Whether the popup is open or not. Can be set to manually open the popup at `lngLat`,
		 * if openOn is not `hover`. */
		/** A callback which can return `false` if the popup should not open.
		 * For example, the features for this popup may not contain any data for the popup. */
		let {
			closeButton = undefined,
			closeOnClickOutside = true,
			closeOnClickInside = false,
			closeOnMove = false,
			openOn = 'click',
			openIfTopMost = true,
			focusAfterOpen = true,
			anchor = undefined,
			offset = undefined,
			popupClass = undefined,
			maxWidth = undefined,
			lngLat = undefined,
			html = undefined,
			open = false,
			canOpen,
			children,
			onopen = undefined,
			onclose = undefined
		} = $$props;

		let inheritedLngLat = getLngLatContext();

		const $$d = $.derived(getMapContext),
			map = $.derived(() => $$d().map),
			eventTopMost = $.derived(() => $$d().eventTopMost),
			markerClickManager = $.derived(() => $$d().markerClickManager),
			loaded = $.derived(() => $$d().loaded);

		const layer = getLayer();
		const layerEvent = getLayerEvent();
		const popupTarget = getPopupTarget();
		const clickEvents = ['click', 'dblclick', 'contextmenu'];
		let popup = void 0;
		let hoveringOnPopup = false;
		let popupElement = void 0;

		function setPopupClickHandler() {
			if (!popup) {
				return;
			}

			let el = popup.getElement();

			if (!el || el === popupElement) {
				return;
			}

			popupElement = el;

			if (openOn === 'hover') {
				popupElement.style.pointerEvents = 'none';
			}

			popupElement.addEventListener(
				'mouseenter',
				() => {
					hoveringOnPopup = true;
				},
				{ passive: true }
			);

			popupElement.addEventListener(
				'mouseleave',
				() => {
					hoveringOnPopup = false;
				},
				{ passive: true }
			);

			// The popup element has some padding, so we need to place it here instead of on the
			// content element that we manage.
			popupElement.addEventListener(
				'click',
				() => {
					if (closeOnClickInside) {
						open = false;
					}
				},
				{ passive: true }
			);
		}

		onDestroy(() => {
			if (loaded() && map()) {
				popup?.remove();
				map().off('click', globalClickHandler);
				map().off('contextmenu', globalClickHandler);
				markerClickManager().remove(globalMarkerClickHandler);

				if (popupTarget?.value instanceof maplibregl.Marker) {
					if (popupTarget.value.getPopup() === popup) {
						popupTarget.value.setPopup(undefined);
					}
				} else if (typeof popupTarget?.value === 'string') {
					map().off('click', popupTarget.value, handleLayerClick);
					map().off('dblclick', popupTarget.value, handleLayerClick);
					map().off('contextmenu', popupTarget.value, handleLayerClick);
					map().off('mousemove', popupTarget.value, handleLayerMouseMove);
					map().off('mouseleave', popupTarget.value, handleLayerMouseLeave);
					map().off('touchstart', popupTarget.value, handleLayerTouchStart);
					map().off('touchend', popupTarget.value, handleLayerTouchEnd);
				}
			}
		});

		function tryToOpen() {
			if (canOpen && !canOpen(features)) {
				open = false;

				return;
			}

			open = true;
		}

		function skipHandlingEvent(e) {
			if (!openIfTopMost) {
				return false;
			}

			// Marker clicks are always only on the top-most marker. Otherwise check for the top-most layer.
			return !('marker' in e) && !isDeckGlMouseEvent(e) && eventTopMost()(e) !== layer?.value;
		}

		let features = void 0;
		let touchOpenState = 'normal';

		function handleLayerEvent(e) {
			if ('layerType' in e && e.layerType === 'deckgl') {
				lngLat = e.coordinate;
				features = e.object ? [e.object] : undefined;
			} else {
				lngLat = e.lngLat;
				features = e.features ?? [];
			}
		}

		function handleLayerClick(e) {
			if (e.type !== openOn || skipHandlingEvent(e)) {
				return;
			}

			handleLayerEvent(e);

			// Wait a tick in case closeOnClick is set. Then the map will close the popup and we'll reopen it
			// just after.
			setTimeout(tryToOpen);
		}

		let touchStartCoords = undefined;

		function handleLayerTouchStart(e) {
			touchStartCoords = e.point;
		}

		function handleLayerTouchEnd(e) {
			if (!touchStartCoords || openOn !== 'hover') {
				return;
			}

			let distance = touchStartCoords.dist(e.point);

			touchStartCoords = undefined;

			if (distance < 3) {
				lngLat = e.lngLat;
				features = e.features ?? [];

				if (popup?.isOpen()) {
					// Pretend we just opened again to avoid the click handler closing the popup.
					touchOpenState = 'justOpened';
				} else {
					touchOpenState = 'opening';
					tryToOpen();
				}
			}
		}

		function handleLayerMouseLeave(e) {
			if (openOn !== 'hover' || touchStartCoords || touchOpenState !== 'normal') {
				return;
			}

			open = false;
			features = undefined;
		}

		function handleLayerMouseMove(e) {
			if (openOn !== 'hover' || touchStartCoords || touchOpenState !== 'normal') {
				return;
			}

			if (skipHandlingEvent(e)) {
				open = false;
				features = undefined;

				return;
			}

			features = e.features ?? [];
			lngLat = e.lngLat;
			tryToOpen();
		}

		function globalClickHandler(e) {
			if (touchOpenState === 'justOpened') {
				touchOpenState = 'normal';

				return;
			}

			if (!closeOnClickOutside) {
				return;
			}

			let checkElements = [
				popupElement,
				popupTarget?.value instanceof maplibregl.Marker ? popupTarget.value?.getElement() : undefined
			];

			if (open && popup?.isOpen() && !checkElements.some((el) => el?.contains(e.originalEvent.target))) {
				if (e.type === 'contextmenu' && openOn === 'contextmenu' || e.type !== 'contextmenu') {
					open = false;
				}
			}
		}

		function globalMarkerClickHandler(info) {
			// Markers don't propagate clicks to the map, so we handle it separately here.
			if (closeOnClickOutside && open && popup?.isOpen() && info.marker !== popupTarget?.value) {
				open = false;
			}
		}

		onDestroy(() => {
			if (loaded() && popup?.isOpen()) {
				popup.remove();
			}
		});

		let popupEl = void 0;
		let actualCloseButton = $.derived(() => closeButton ?? (!closeOnClickOutside && !closeOnClickInside));

		// We handle this ourselves to improve behavior on mobile.
		let hoveringOnLayer = $.derived(() => openOn === 'hover' && (layerEvent.value?.type === 'mousemove' || layerEvent.value?.type === 'mouseenter'));

		if (children) {
			$$renderer.push(`<!--[0--><div class="sv-popup">`);

			if (features?.length || popupTarget?.value instanceof maplibregl.Marker || !popupTarget && open) {
				$$renderer.push('<!--[0-->');

				children?.($$renderer, {
					features,
					data: features?.[0] ?? undefined,
					map: map(),
					close: () => open = false,
					isOpen: open
				});

				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { lngLat, open });
	});
}