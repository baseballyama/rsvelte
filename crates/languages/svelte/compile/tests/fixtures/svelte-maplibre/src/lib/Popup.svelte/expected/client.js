import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div class="sv-popup"><!></div>`);

export default function Popup($$anchor, $$props) {
	$.push($$props, true);

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
	let closeButton = $.prop($$props, 'closeButton', 3, undefined),
		closeOnClickOutside = $.prop($$props, 'closeOnClickOutside', 3, true),
		closeOnClickInside = $.prop($$props, 'closeOnClickInside', 3, false),
		closeOnMove = $.prop($$props, 'closeOnMove', 3, false),
		openOn = $.prop($$props, 'openOn', 3, 'click'),
		openIfTopMost = $.prop($$props, 'openIfTopMost', 3, true),
		focusAfterOpen = $.prop($$props, 'focusAfterOpen', 3, true),
		anchor = $.prop($$props, 'anchor', 3, undefined),
		offset = $.prop($$props, 'offset', 3, undefined),
		popupClass = $.prop($$props, 'popupClass', 3, undefined),
		maxWidth = $.prop($$props, 'maxWidth', 3, undefined),
		lngLat = $.prop($$props, 'lngLat', 15, undefined),
		html = $.prop($$props, 'html', 3, undefined),
		open = $.prop($$props, 'open', 15, false),
		onopen = $.prop($$props, 'onopen', 3, undefined),
		onclose = $.prop($$props, 'onclose', 3, undefined);

	let inheritedLngLat = getLngLatContext();

	const $$d = $.derived(getMapContext),
		map = $.derived(() => $.get($$d).map),
		eventTopMost = $.derived(() => $.get($$d).eventTopMost),
		markerClickManager = $.derived(() => $.get($$d).markerClickManager),
		loaded = $.derived(() => $.get($$d).loaded);

	const layer = getLayer();
	const layerEvent = getLayerEvent();
	const popupTarget = getPopupTarget();
	const clickEvents = ['click', 'dblclick', 'contextmenu'];
	let popup = $.state(void 0);
	let hoveringOnPopup = $.state(false);
	let popupElement = $.state(void 0);

	function setPopupClickHandler() {
		if (!$.get(popup)) {
			return;
		}

		let el = $.get(popup).getElement();

		if (!el || el === $.get(popupElement)) {
			return;
		}

		$.set(popupElement, el, true);

		if (openOn() === 'hover') {
			$.get(popupElement).style.pointerEvents = 'none';
		}

		$.get(popupElement).addEventListener(
			'mouseenter',
			() => {
				$.set(hoveringOnPopup, true);
			},
			{ passive: true }
		);

		$.get(popupElement).addEventListener(
			'mouseleave',
			() => {
				$.set(hoveringOnPopup, false);
			},
			{ passive: true }
		);

		// The popup element has some padding, so we need to place it here instead of on the
		// content element that we manage.
		$.get(popupElement).addEventListener(
			'click',
			() => {
				if (closeOnClickInside()) {
					open(false);
				}
			},
			{ passive: true }
		);
	}

	$.user_pre_effect(() => {
		if (!$.get(map)) {
			return;
		}

		$.get(map).on('click', globalClickHandler);
		$.get(map).on('contextmenu', globalClickHandler);
		$.get(markerClickManager).add(globalMarkerClickHandler);

		if (typeof popupTarget?.value === 'string') {
			$.get(map).on('click', popupTarget.value, handleLayerClick);
			$.get(map).on('dblclick', popupTarget.value, handleLayerClick);
			$.get(map).on('contextmenu', popupTarget.value, handleLayerClick);
			$.get(map).on('mousemove', popupTarget.value, handleLayerMouseMove);
			$.get(map).on('mouseleave', popupTarget.value, handleLayerMouseLeave);
			$.get(map).on('touchstart', popupTarget.value, handleLayerTouchStart);
			$.get(map).on('touchend', popupTarget.value, handleLayerTouchEnd);
		}
	});

	onDestroy(() => {
		if ($.get(loaded) && $.get(map)) {
			$.get(popup)?.remove();
			$.get(map).off('click', globalClickHandler);
			$.get(map).off('contextmenu', globalClickHandler);
			$.get(markerClickManager).remove(globalMarkerClickHandler);

			if (popupTarget?.value instanceof maplibregl.Marker) {
				if (popupTarget.value.getPopup() === $.get(popup)) {
					popupTarget.value.setPopup(undefined);
				}
			} else if (typeof popupTarget?.value === 'string') {
				$.get(map).off('click', popupTarget.value, handleLayerClick);
				$.get(map).off('dblclick', popupTarget.value, handleLayerClick);
				$.get(map).off('contextmenu', popupTarget.value, handleLayerClick);
				$.get(map).off('mousemove', popupTarget.value, handleLayerMouseMove);
				$.get(map).off('mouseleave', popupTarget.value, handleLayerMouseLeave);
				$.get(map).off('touchstart', popupTarget.value, handleLayerTouchStart);
				$.get(map).off('touchend', popupTarget.value, handleLayerTouchEnd);
			}
		}
	});

	function tryToOpen() {
		if ($$props.canOpen && !$$props.canOpen($.get(features))) {
			open(false);

			return;
		}

		open(true);
	}

	function skipHandlingEvent(e) {
		if (!openIfTopMost()) {
			return false;
		}

		// Marker clicks are always only on the top-most marker. Otherwise check for the top-most layer.
		return !('marker' in e) && !isDeckGlMouseEvent(e) && $.get(eventTopMost)(e) !== layer?.value;
	}

	let features = $.state(void 0);
	let touchOpenState = $.state('normal');

	function handleLayerEvent(e) {
		if ('layerType' in e && e.layerType === 'deckgl') {
			lngLat(e.coordinate);
			$.set(features, e.object ? [e.object] : undefined, true);
		} else {
			lngLat(e.lngLat);
			$.set(features, e.features ?? [], true);
		}
	}

	function handleLayerClick(e) {
		if (e.type !== openOn() || skipHandlingEvent(e)) {
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
		if (!touchStartCoords || openOn() !== 'hover') {
			return;
		}

		let distance = touchStartCoords.dist(e.point);

		touchStartCoords = undefined;

		if (distance < 3) {
			lngLat(e.lngLat);
			$.set(features, e.features ?? [], true);

			if ($.get(popup)?.isOpen()) {
				// Pretend we just opened again to avoid the click handler closing the popup.
				$.set(touchOpenState, 'justOpened');
			} else {
				$.set(touchOpenState, 'opening');
				tryToOpen();
			}
		}
	}

	function handleLayerMouseLeave(e) {
		if (openOn() !== 'hover' || touchStartCoords || $.get(touchOpenState) !== 'normal') {
			return;
		}

		open(false);
		$.set(features, undefined);
	}

	function handleLayerMouseMove(e) {
		if (openOn() !== 'hover' || touchStartCoords || $.get(touchOpenState) !== 'normal') {
			return;
		}

		if (skipHandlingEvent(e)) {
			open(false);
			$.set(features, undefined);

			return;
		}

		$.set(features, e.features ?? [], true);
		lngLat(e.lngLat);
		tryToOpen();
	}

	function globalClickHandler(e) {
		if ($.get(touchOpenState) === 'justOpened') {
			$.set(touchOpenState, 'normal');

			return;
		}

		if (!closeOnClickOutside()) {
			return;
		}

		let checkElements = [
			$.get(popupElement),
			popupTarget?.value instanceof maplibregl.Marker ? popupTarget.value?.getElement() : undefined
		];

		if (open() && $.get(popup)?.isOpen() && !checkElements.some((el) => el?.contains(e.originalEvent.target))) {
			if (e.type === 'contextmenu' && openOn() === 'contextmenu' || e.type !== 'contextmenu') {
				open(false);
			}
		}
	}

	function globalMarkerClickHandler(info) {
		// Markers don't propagate clicks to the map, so we handle it separately here.
		if (closeOnClickOutside() && open() && $.get(popup)?.isOpen() && info.marker !== popupTarget?.value) {
			open(false);
		}
	}

	onDestroy(() => {
		if ($.get(loaded) && $.get(popup)?.isOpen()) {
			$.get(popup).remove();
		}
	});

	let popupEl = $.state(void 0);
	let actualCloseButton = $.derived(() => closeButton() ?? (!closeOnClickOutside() && !closeOnClickInside()));

	$.user_effect(() => {
		if (!$.get(popup)) {
			let fullPopupClass = popupClass()
				? `${popupClass()} sv-maplibregl-popup`
				: 'sv-maplibregl-popup';

			$.set(
				popup,
				new maplibregl.Popup({
					closeButton: $.get(actualCloseButton),
					// We handle this ourselves to improve behavior on mobile.
					closeOnClick: false,
					closeOnMove: closeOnMove(),
					focusAfterOpen: focusAfterOpen(),
					maxWidth: maxWidth(),
					className: fullPopupClass,
					anchor: anchor(),
					offset: offset()
				}),
				true
			);

			$.set(popupElement, $.get(popup).getElement(), true);

			$.get(popup).on('open', () => {
				tryToOpen();

				if (open()) {
					setPopupClickHandler();
					onopen()?.($.get(popup));
				}
			});

			$.get(popup).on('close', () => {
				open(false);
				onclose()?.($.get(popup));
			});
		}
	});

	$.user_effect(() => {
		if ($.get(popup) && popupTarget?.value instanceof maplibregl.Marker) {
			if (openOn() === 'click') {
				popupTarget.value.setPopup($.get(popup));
			} else if (popupTarget.value.getPopup() === $.get(popup)) {
				popupTarget.value.setPopup(undefined);
			}
		}
	});

	$.user_effect(() => {
		if (clickEvents.includes(openOn()) && layerEvent.value?.type === openOn()) {
			handleLayerClick(layerEvent.value);
			layerEvent.value = undefined;
		}
	});

	let hoveringOnLayer = $.derived(() => openOn() === 'hover' && (layerEvent.value?.type === 'mousemove' || layerEvent.value?.type === 'mouseenter'));

	$.user_effect(() => {
		if (openOn() === 'hover' && layerEvent) {
			if ($.get(hoveringOnLayer) && layerEvent.value) {
				handleLayerEvent(layerEvent.value);
			}

			if ($.get(hoveringOnLayer) || $.get(hoveringOnPopup)) {
				tryToOpen();
			} else {
				open(false);
			}
		}
	});

	$.user_effect(() => {
		if ($.get(popupEl)) {
			$.get(popup)?.setDOMContent($.get(popupEl));
		} else if (html()) {
			$.get(popup)?.setHTML(html());
		}
	});

	$.user_effect(() => {
		let actualLnglat = lngLat() ?? inheritedLngLat?.value ?? undefined;

		if (actualLnglat) $.get(popup)?.setLngLat(actualLnglat);
	});

	$.user_effect(() => {
		if ($.get(map) && $.get(popup)) {
			let isOpen = $.get(popup).isOpen();

			if (open() && !isOpen) {
				$.get(popup).addTo($.get(map));

				if ($.get(touchOpenState) === 'opening') {
					$.set(touchOpenState, 'justOpened');
				}
			} else if (!open() && isOpen) {
				$.get(popup).remove();
			}
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			{
				var consequent = ($$anchor) => {
					var fragment_1 = $.comment();
					var node_2 = $.first_child(fragment_1);

					$.snippet(node_2, () => $$props.children ?? $.noop, () => ({
						features: $.get(features),
						data: $.get(features)?.[0] ?? undefined,
						map: $.get(map),
						close: () => open(false),
						isOpen: open()
					}));

					$.append($$anchor, fragment_1);
				};

				$.if(node_1, ($$render) => {
					if ($.get(features)?.length || popupTarget?.value instanceof maplibregl.Marker || !popupTarget && open()) $$render(consequent);
				});
			}

			$.reset(div);
			$.bind_this(div, ($$value) => $.set(popupEl, $$value), () => $.get(popupEl));
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}