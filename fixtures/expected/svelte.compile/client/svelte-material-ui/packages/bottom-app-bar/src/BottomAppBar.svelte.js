import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, setContext } from 'svelte';
import { readable, writable } from 'svelte/store';
import { classMap, useActions } from '@smui/common/internal';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'style',
	'variant',
	'color',
	'children'
]);

var root = $.from_html(`<div><!></div>`);

export default function BottomAppBar($$anchor, $$props) {
	$.push($$props, true);

	const $colorStore = () => $.store_get(colorStore, '$colorStore', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * A list of CSS styles.
	 */
	/**
	 * The type of app bar to display.
	 */
	/**
	 * The color of the app bar.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		style = $.prop($$props, 'style', 3, ''),
		variant = $.prop($$props, 'variant', 3, 'standard'),
		color = $.prop($$props, 'color', 3, 'primary'),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	let internalStyles = $.proxy({});
	const colorStore = writable(color());
	let withFab = $.state(false);
	let adjustOffset = $.state(0);

	$.user_effect(() => {
		$.store_set(colorStore, color());
	});

	setContext('SMUI:bottom-app-bar:color', colorStore);

	let propStoreSet = $.state(void 0);

	let propStore = readable(
		{
			withFab: $.get(withFab),
			adjustOffset: $.get(adjustOffset),
			variant: variant()
		},
		(set) => {
			$.set(propStoreSet, set, true);
		}
	);

	$.user_effect(() => {
		if ($.get(propStoreSet)) {
			$.get(propStoreSet)({
				withFab: $.get(withFab),
				adjustOffset: $.get(adjustOffset),
				variant: variant()
			});
		}
	});

	onMount(() => {
		const observer = new MutationObserver(() => {
			if (variant() === 'standard' || variant() === 'fixed') {
				$.set(withFab, getElement()?.querySelector('.mdc-fab') != null);
			} else {
				$.set(withFab, false);
			}
		});

		observer.observe(getElement(), { childList: true, subtree: true });

		return () => {
			observer.disconnect();
		};
	});

	function addStyle(name, value) {
		if (internalStyles[name] != value) {
			if (value === '' || value == null) {
				delete internalStyles[name];
			} else {
				internalStyles[name] = value;
			}
		}
	}

	// A lot of this code was adapted from
	// https://github.com/material-components/material-components-web/blob/v14.0.0/packages/mdc-top-app-bar/standard/foundation.ts
	const DEBOUNCE_THROTTLE_RESIZE_TIME_MS = 100;

	/**
	 * Indicates if the bottom app bar was docked in the previous scroll handler iteration.
	 */
	let wasDocked = true;

	/**
	 * Indicates if the bottom app bar is docked in the fully shown position.
	 */
	let isDockedShowing = true;

	/**
	 * Variable for current scroll position of the bottom app bar
	 */
	let currentAppBarOffsetBottom = 0;

	/**
	 * Used to prevent the bottom app bar from being scrolled out of view during resize events
	 */
	let isCurrentlyBeingResized = false;

	/**
	 * The timeout that's used to throttle the resize events
	 */
	let resizeThrottleId = 0;

	/**
	 * Used for diffs of current scroll position vs previous scroll position
	 */
	let lastScrollPosition;

	/**
	 * Used to verify when the bottom app bar is completely showing or completely hidden
	 */
	let bottomAppBarHeight;

	/**
	 * The timeout that's used to debounce toggling the isCurrentlyBeingResized
	 * variable after a resize
	 */
	let resizeDebounceId = 0;

	function getViewportScrollY() {
		const win = window;
		const el = window;

		return win.pageYOffset !== undefined ? win.pageYOffset : el.scrollTop;
	}

	function getTopAppBarHeight() {
		return getElement().getBoundingClientRect().height;
	}

	let oldVariant = null;

	$.user_effect(() => {
		if (element && variant() !== oldVariant) {
			if (variant() === 'standard') {
				lastScrollPosition = getViewportScrollY();
				bottomAppBarHeight = getTopAppBarHeight();
			} else if (oldVariant === 'standard') {
				addStyle('bottom', '');
				addStyle('--smui-bottom-app-bar--fab-offset', '0px');
				$.set(adjustOffset, 0);
			}

			oldVariant = variant();
		}
	});

	/**
	 * Scroll handler for the default scroll behavior of the bottom app bar.
	 */
	function handleTargetScroll() {
		if (variant() !== 'standard') {
			return;
		}

		const currentScrollPosition = Math.max(getViewportScrollY(), 0);
		const diff = currentScrollPosition - lastScrollPosition;

		lastScrollPosition = currentScrollPosition;

		// If the window is being resized the lastScrollPosition needs to be updated
		// but the current scroll of the bottom app bar should stay in the same
		// position.
		if (!isCurrentlyBeingResized) {
			currentAppBarOffsetBottom -= diff;

			if (currentAppBarOffsetBottom > 0) {
				currentAppBarOffsetBottom = 0;
			} else if (Math.abs(currentAppBarOffsetBottom) > bottomAppBarHeight) {
				currentAppBarOffsetBottom = -bottomAppBarHeight;
			}

			moveTopAppBar();
		}
	}

	/**
	 * Top app bar resize handler that throttle/debounce functions that execute updates.
	 */
	function handleWindowResize() {
		if (variant() !== 'standard') {
			return;
		}

		// Throttle resize events 10 p/s
		if (!resizeThrottleId) {
			resizeThrottleId = setTimeout(
				() => {
					resizeThrottleId = 0;
					throttledResizeHandler();
				},
				DEBOUNCE_THROTTLE_RESIZE_TIME_MS
			);
		}

		isCurrentlyBeingResized = true;

		if (resizeDebounceId) {
			clearTimeout(resizeDebounceId);
		}

		resizeDebounceId = setTimeout(
			() => {
				handleTargetScroll();
				isCurrentlyBeingResized = false;
				resizeDebounceId = 0;
			},
			DEBOUNCE_THROTTLE_RESIZE_TIME_MS
		);
	}

	/**
	 * Function to determine if the DOM needs to update.
	 */
	function checkForUpdate() {
		const offscreenBoundaryBottom = -bottomAppBarHeight;
		const hasAnyPixelsOffscreen = currentAppBarOffsetBottom < 0;
		const hasAnyPixelsOnscreen = currentAppBarOffsetBottom > offscreenBoundaryBottom;
		const partiallyShowing = hasAnyPixelsOffscreen && hasAnyPixelsOnscreen;

		// If it's partially showing, it can't be docked.
		if (partiallyShowing) {
			wasDocked = false;
		} else {
			// Not previously docked and not partially showing, it's now docked.
			if (!wasDocked) {
				wasDocked = true;

				return true;
			} else if (isDockedShowing !== hasAnyPixelsOnscreen) {
				isDockedShowing = hasAnyPixelsOnscreen;

				return true;
			}
		}

		return partiallyShowing;
	}

	/**
	 * Function to move the bottom app bar if needed.
	 */
	function moveTopAppBar() {
		if (checkForUpdate()) {
			let offset = currentAppBarOffsetBottom;

			addStyle('--smui-bottom-app-bar--fab-offset', offset * 0.75 + 'px');
			addStyle('bottom', offset + 'px');
			$.set(adjustOffset, offset, true);

			if ($.get(withFab)) {
				$.set(adjustOffset, $.get(adjustOffset) - +offset * 0.75);
			}
		}
	}

	/**
	 * Throttled function that updates the bottom app bar scrolled values if the
	 * bottom app bar height changes.
	 */
	function throttledResizeHandler() {
		const currentHeight = getTopAppBarHeight();

		if (bottomAppBarHeight !== currentHeight) {
			wasDocked = false;

			// Since the bottom app bar has a different height depending on the screen width, this
			// will ensure that the bottom app bar remains in the correct location if
			// completely hidden and a resize makes the bottom app bar a different height.
			currentAppBarOffsetBottom -= bottomAppBarHeight - currentHeight;

			bottomAppBarHeight = currentHeight;
		}

		handleTargetScroll();
	}

	function getPropStore() {
		return propStore;
	}

	function getElement() {
		return element;
	}

	var $$exports = { getPropStore, getElement };
	var div = root();

	$.event('scroll', $.window, handleTargetScroll);
	$.event('resize', $.window, handleWindowResize);

	$.attribute_effect(div, ($0, $1) => ({ class: $0, style: $1, ...restProps }), [
		() => classMap({
			'smui-bottom-app-bar': true,
			'smui-bottom-app-bar--standard': variant() === 'standard',
			'smui-bottom-app-bar--fixed': variant() === 'fixed',
			[className()]: true
		}),
		() => Object.entries(internalStyles).map(([name, value]) => `${name}: ${value};`).concat([style()]).join(' ')
	]);

	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.bind_this(div, ($$value) => element = $$value, () => element);
	$.action(div, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
	$.append($$anchor, div);

	var $$pop = $.pop($$exports);

	$$cleanup();

	return $$pop;
}