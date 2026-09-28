import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, getContext, setContext } from 'svelte';

import {
	classMap,
	exclude,
	prefixFilter,
	useActions,
	dispatch,
	SvelteEventManager
} from '@smui/common/internal';

import {
	MDCTooltipFoundation,
	AnchorBoundaryType,
	XPosition,
	YPosition,
	CssClasses
} from './mdc';

let counter = 0;

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'style',
	'id',
	'unbounded',
	'xPos',
	'yPos',
	'persistent',
	'interactive',
	'hideFromScreenreader',
	'showDelay',
	'hideDelay',
	'surface$class',
	'surface$style',
	'children'
]);

var root = $.from_html(`<div><div><!></div></div>`);

export default function Tooltip($$anchor, $$props) {
	$.push($$props, true);

	const $anchor = () => $.store_get(anchor, '$anchor', $$stores);
	const $tooltip = () => $.store_get(tooltip, '$tooltip', $$stores);
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
	 * The ID of the tooltip.
	 *
	 * If one is not provided, one will be generated.
	 */
	/**
	 * Whether the tooltip should use unbounded styling.
	 *
	 * Unbounded styling adds more gap between the anchor element and the
	 * tooltip.
	 */
	/**
	 * The horizontal position of the tooltip.
	 */
	/**
	 * The vertical position of the tooltip.
	 */
	/**
	 * Whether the tooltip should act as a persistent popup.
	 *
	 * A persistent rich tooltip shows up when you click or press enter/space
	 * bar on an element and goes away when you activate it again or it loses
	 * focus. Great for informational popups on those little "i" icons.
	 */
	/**
	 * Whether the tooltip will have interative elements inside.
	 *
	 * Using this lets the browser know that this is an interactive area, not
	 * just an informational tooltip, helping with accessibility.
	 */
	/**
	 * Whether the tooltip should be hidden from users using screen readers.
	 *
	 * You should only use this if the information in the tooltip is either
	 * redundant or unhelpful.
	 */
	/**
	 * The delay before the tooltip is shown when the user hovers.
	 *
	 * Defaults to 500ms.
	 */
	/**
	 * The delay before the tooltip is hidden when the user quits hovering.
	 *
	 * Defaults to 600ms.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * A list of CSS styles.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		style = $.prop($$props, 'style', 3, ''),
		id = $.prop($$props, 'id', 19, () => 'SMUI-tooltip-' + counter++),
		unbounded = $.prop($$props, 'unbounded', 3, false),
		xPos = $.prop($$props, 'xPos', 3, 'detected'),
		yPos = $.prop($$props, 'yPos', 3, 'detected'),
		persistent = $.prop($$props, 'persistent', 3, false),
		interactive = $.prop($$props, 'interactive', 19, persistent),
		hideFromScreenreader = $.prop($$props, 'hideFromScreenreader', 3, false),
		showDelay = $.prop($$props, 'showDelay', 3, undefined),
		hideDelay = $.prop($$props, 'hideDelay', 3, undefined),
		surface$class = $.prop($$props, 'surface$class', 3, ''),
		surface$style = $.prop($$props, 'surface$style', 3, ''),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	let instance = $.state(void 0);
	let eventManager = new SvelteEventManager();
	let nonReactiveLocationStore = {};
	let internalClasses = $.proxy({});
	let internalStyles = $.proxy({});
	let internalAttrs = $.proxy({});
	let surfaceAnimationStyles = $.proxy({});
	let anchor = getContext('SMUI:tooltip:wrapper:anchor');
	let tooltip = getContext('SMUI:tooltip:wrapper:tooltip');
	const rich = getContext('SMUI:tooltip:rich');

	const roleProps = $.derived(() => ({
		role: rich && interactive() ? 'dialog' : 'tooltip',
		tabindex: rich && persistent() ? -1 : undefined
	}));

	let previousAnchor = undefined;

	$.user_effect(() => {
		if ($.get(instance) && previousAnchor !== $anchor()) {
			if (previousAnchor) {
				destroy(previousAnchor);
			}

			if ($anchor()) {
				init($anchor());
			}

			previousAnchor = $anchor();
		}
	});

	$.user_effect(() => {
		if ($.get(instance)) {
			$.get(instance).setAnchorBoundaryType(AnchorBoundaryType[unbounded() ? 'UNBOUNDED' : 'BOUNDED']);
		}
	});

	$.user_effect(() => {
		if ($.get(instance)) {
			$.get(instance).setTooltipPosition({
				xPos: XPosition[xPos().toUpperCase()],
				yPos: YPosition[yPos().toUpperCase()]
			});
		}
	});

	$.user_effect(() => {
		if ($.get(instance) && showDelay() != null) {
			$.get(instance).setShowDelay(showDelay());
		}
	});

	$.user_effect(() => {
		if ($.get(instance) && hideDelay() != null) {
			$.get(instance).setHideDelay(hideDelay());
		}
	});

	setContext('SMUI:label:context', 'tooltip');

	onMount(() => {
		$.set(
			instance,
			new MDCTooltipFoundation({
				getAttribute: getAttr,
				setAttribute: addAttr,
				removeAttribute: removeAttr,
				addClass,
				hasClass,
				removeClass,
				getComputedStyleProperty: (propertyName) => {
					const element = getElement();
					let style = getComputedStyle(element).getPropertyValue(propertyName);

					if (style === 'auto') {
						element.classList.add('smui-banner--force-show');
						style = getComputedStyle(element).getPropertyValue(propertyName);
						element.classList.remove('smui-banner--force-show');
					}

					return style;
				},
				setStyleProperty: addStyle,
				setSurfaceAnimationStyleProperty: addSurfaceAnimationStyle,
				getViewportWidth: () => window.innerWidth,
				getViewportHeight: () => window.innerHeight,
				getTooltipSize: () => {
					const element = getElement();
					let size = { width: element.offsetWidth, height: element.offsetHeight };

					if (size.width === 0 || size.height === 0) {
						element.classList.add('smui-banner--force-show');
						size = { width: element.offsetWidth, height: element.offsetHeight };
						element.classList.remove('smui-banner--force-show');
					}

					return size;
				},

				getAnchorBoundingRect: () => {
					return $anchor() ? $anchor().getBoundingClientRect() : null;
				},

				getParentBoundingRect: () => {
					let parent = getElement().parentElement;

					if (!rich) {
						parent = document.body;
					}

					return parent?.getBoundingClientRect() || null;
				},

				getAnchorAttribute: (attr) => {
					return $anchor() ? $anchor().getAttribute(attr) : null;
				},

				setAnchorAttribute: (attr, value) => {
					$anchor() && $anchor().setAttribute(attr, value);
				},
				isRTL: () => getComputedStyle(getElement()).direction === 'rtl',
				anchorContainsElement: (element) => {
					return !!($anchor() && $anchor().contains(element));
				},

				tooltipContainsElement: (element) => {
					return getElement().contains(element);
				},

				focusAnchorElement: () => {
					$anchor() && $anchor().focus();
				},
				registerEventHandler: (evt, handler) => eventManager.on(getElement(), evt, handler),
				deregisterEventHandler: (evt, handler) => eventManager.off(getElement(), evt, handler),
				registerAnchorEventHandler: (evt, handler) => $anchor() && eventManager.on($anchor(), evt, handler),
				deregisterAnchorEventHandler: (evt, handler) => $anchor() && eventManager.off($anchor(), evt, handler),
				registerDocumentEventHandler: (evt, handler) => eventManager.on(document.body, evt, handler),
				deregisterDocumentEventHandler: (evt, handler) => eventManager.off(document.body, evt, handler),
				registerWindowEventHandler: (evt, handler) => eventManager.on(window, evt, handler, evt === 'scroll' && { capture: true, passive: true } || undefined),
				deregisterWindowEventHandler: (evt, handler) => eventManager.off(window, evt, handler),
				notifyHidden: () => {
					dispatch(getElement(), 'SMUITooltipHidden');
				},

				notifyShown: () => {
					dispatch(getElement(), 'SMUITooltipShown');
				},

				// TODO: figure out why MDC-Web included these caret functions, because they're entirely undocumented.
				getTooltipCaretBoundingRect: () => {
					const caret = getElement().querySelector(`.${CssClasses.TOOLTIP_CARET_TOP}`);

					if (!caret) {
						return null;
					}

					return caret.getBoundingClientRect();
				},

				setTooltipCaretStyle: (propertyName, value) => {
					const topCaret = getElement().querySelector(`.${CssClasses.TOOLTIP_CARET_TOP}`);
					const bottomCaret = getElement().querySelector(`.${CssClasses.TOOLTIP_CARET_BOTTOM}`);

					if (!topCaret || !bottomCaret) {
						return;
					}

					topCaret.style.setProperty(propertyName, value);
					bottomCaret.style.setProperty(propertyName, value);
				},

				clearTooltipCaretStyles: () => {
					const topCaret = getElement().querySelector(`.${CssClasses.TOOLTIP_CARET_TOP}`);
					const bottomCaret = getElement().querySelector(`.${CssClasses.TOOLTIP_CARET_BOTTOM}`);

					if (!topCaret || !bottomCaret) {
						return;
					}

					topCaret.removeAttribute('style');
					bottomCaret.removeAttribute('style');
				},
				getActiveElement: () => document.activeElement,
				isInstanceOfElement: (eventTarget) => eventTarget instanceof Element
			}),
			true
		);

		$.store_set(tooltip, element);

		return () => {
			if ($anchor()) {
				destroy($anchor());
			}

			$.get(instance)?.destroy();
			$.set(instance, undefined);
			eventManager.clear();

			if (!rich && typeof document !== 'undefined' && document.body === getElement()?.parentElement && nonReactiveLocationStore.parent !== getElement()?.parentElement && nonReactiveLocationStore.parent?.insertBefore) {
				nonReactiveLocationStore.parent?.insertBefore(getElement(), nonReactiveLocationStore.nextSibling && nonReactiveLocationStore.nextSibling.parentElement === nonReactiveLocationStore.parent ? nonReactiveLocationStore.nextSibling : null);
			} else if (getElement()?.parentElement) {
				getElement()?.remove();
			}
		};
	});

	function destroy(anchor) {
		eventManager.off(anchor, 'focusout', handleAnchorFocusOut);

		if (rich && persistent()) {
			eventManager.off(anchor, 'click', handleAnchorActivate);
			eventManager.off(anchor, 'keydown', handleAnchorActivate);
		} else {
			eventManager.off(anchor, 'mouseenter', handleAnchorMouseEnter);
			eventManager.off(anchor, 'focusin', handleAnchorFocus);
			eventManager.off(anchor, 'mouseleave', handleAnchorMouseLeave);
			eventManager.off(anchor, 'touchstart', handleAnchorTouchStart);
			eventManager.off(anchor, 'touchend', handleAnchorTouchEnd);
		}

		if (rich && interactive()) {
			anchor.removeAttribute('aria-haspopup');
			anchor.removeAttribute('aria-expanded');
			anchor.removeAttribute('data-tooltip-id');
		} else {
			anchor.removeAttribute('aria-describedby');
		}

		$.get(instance)?.destroy();
		$.set(instance, undefined);
	}

	function init(anchor) {
		eventManager.on(anchor, 'focusout', handleAnchorFocusOut);

		if (rich && persistent()) {
			eventManager.on(anchor, 'click', handleAnchorActivate);
			eventManager.on(anchor, 'keydown', handleAnchorActivate);
		} else {
			eventManager.on(anchor, 'mouseenter', handleAnchorMouseEnter);
			eventManager.on(anchor, 'focusin', handleAnchorFocus);
			eventManager.on(anchor, 'mouseleave', handleAnchorMouseLeave);
			eventManager.on(anchor, 'touchstart', handleAnchorTouchStart);
			eventManager.on(anchor, 'touchend', handleAnchorTouchEnd);
		}

		if (rich && interactive()) {
			anchor.setAttribute('aria-haspopup', 'dialog');
			anchor.setAttribute('aria-expanded', 'false');
			anchor.setAttribute('data-tooltip-id', id());
		} else {
			anchor.setAttribute('aria-describedby', id());
		}

		if (!rich) {
			hoistToBody();
		}

		$.get(instance)?.init();
	}

	function hasClass(className) {
		return className in internalClasses
			? internalClasses[className]
			: getElement().classList.contains(className);
	}

	function addClass(className) {
		if (!internalClasses[className]) {
			internalClasses[className] = true;
		}
	}

	function removeClass(className) {
		if (!(className in internalClasses) || internalClasses[className]) {
			internalClasses[className] = false;
		}
	}

	function addStyle(name, value) {
		if (internalStyles[name] != value) {
			if (value === '' || value == null) {
				delete internalStyles[name];
			} else {
				internalStyles[name] = value;
			}
		}
	}

	function addSurfaceAnimationStyle(name, value) {
		if (surfaceAnimationStyles[name] != value) {
			if (value === '' || value == null) {
				delete surfaceAnimationStyles[name];
			} else {
				surfaceAnimationStyles[name] = value;
			}
		}
	}

	function getAttr(name) {
		return name in internalAttrs
			? internalAttrs[name] ?? null
			: getElement().getAttribute(name);
	}

	function addAttr(name, value) {
		if (internalAttrs[name] !== value) {
			internalAttrs[name] = value;
		}
	}

	function removeAttr(name) {
		if (!(name in internalAttrs) || internalAttrs[name] != null) {
			internalAttrs[name] = undefined;
		}
	}

	function handleAnchorFocusOut(event) {
		// The foundation only watches for blur, which
		// doesn't fire on all components you would
		// anchor a tooltip to (since it doesn't
		// bubble), so we handle focusout like a blur.
		if (getElement().contains(event.relatedTarget)) {
			return;
		}

		$.get(instance) && $.get(instance).hide();
	}

	function handleAnchorActivate(event) {
		if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') {
			return;
		}

		$.get(instance) && $.get(instance).handleAnchorClick();
	}

	function handleAnchorMouseEnter() {
		$.get(instance) && $.get(instance).handleAnchorMouseEnter();
	}

	function handleAnchorFocus(event) {
		$.get(instance) && $.get(instance).handleAnchorFocus(event);
	}

	function handleAnchorMouseLeave() {
		$.get(instance) && $.get(instance).handleAnchorMouseLeave();
	}

	function handleAnchorTouchStart() {
		// Purposefully capitalized differently to match MDC.
		$.get(instance) && $.get(instance).handleAnchorTouchstart();
	}

	function handleAnchorTouchEnd() {
		// Purposefully capitalized differently to match MDC.
		$.get(instance) && $.get(instance).handleAnchorTouchend();
	}

	function hoistToBody() {
		if ($anchor() && document.body !== getElement().parentNode) {
			nonReactiveLocationStore.parent = getElement().parentElement ?? undefined;
			nonReactiveLocationStore.nextSibling = getElement().nextElementSibling;
			document.body.appendChild(getElement());
		}
	}

	function attachScrollHandler(addEventListenerFn) {
		$.get(instance) && $.get(instance).attachScrollHandler(addEventListenerFn);
	}

	function removeScrollHandler(removeEventHandlerFn) {
		$.get(instance) && $.get(instance).removeScrollHandler(removeEventHandlerFn);
	}

	function getElement() {
		return element;
	}

	var $$exports = { attachScrollHandler, removeScrollHandler, getElement };
	var div = root();

	var event_handler = (e) => {
		if ($.get(instance)) {
			$.get(instance).handleTransitionEnd();
		}

		$$props.ontransitionend?.(e);
	};

	$.attribute_effect(
		div,
		($0, $1, $2) => ({
			class: $0,
			style: $1,
			'aria-hidden': 'true',
			id: id(),
			'data-mdc-tooltip-persist': rich && persistent() ? 'true' : undefined,
			'data-mdc-tooltip-persistent': rich && persistent() ? 'true' : undefined,
			'data-mdc-tooltip-has-caret': undefined,
			'data-hide-tooltip-from-screenreader': hideFromScreenreader() ? 'true' : undefined,
			...$.get(roleProps),
			...internalAttrs,
			...$2,
			ontransitionend: event_handler
		}),
		[
			() => classMap({
				'mdc-tooltip': true,
				'mdc-tooltip--rich': rich,
				...internalClasses,
				[className()]: true
			}),
			() => Object.entries(internalStyles).map(([name, value]) => `${name}: ${value};`).concat([style()]).join(' '),
			() => exclude(restProps, ['surface$'])
		]
	);

	var div_1 = $.child(div);

	$.attribute_effect(div_1, ($0, $1, $2) => ({ class: $0, style: $1, ...$2 }), [
		() => classMap({
			'mdc-tooltip__surface': true,
			'mdc-tooltip__surface-animation': true,
			[surface$class()]: true
		}),
		() => Object.entries(surfaceAnimationStyles).map(([name, value]) => `${name}: ${value};`).concat([surface$style()]).join(' '),
		() => prefixFilter(restProps, 'surface$')
	]);

	var node = $.child(div_1);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div_1);
	$.reset(div);
	$.bind_this(div, ($$value) => element = $$value, () => element);
	$.action(div, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
	$.append($$anchor, div);

	var $$pop = $.pop($$exports);

	$$cleanup();

	return $$pop;
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
	 * The ID of the tooltip.
	 *
	 * If one is not provided, one will be generated.
	 */
	/**
	 * Whether the tooltip should use unbounded styling.
	 *
	 * Unbounded styling adds more gap between the anchor element and the
	 * tooltip.
	 */
	/**
	 * The horizontal position of the tooltip.
	 */
	/**
	 * The vertical position of the tooltip.
	 */
	/**
	 * Whether the tooltip should act as a persistent popup.
	 *
	 * A persistent rich tooltip shows up when you click or press enter/space
	 * bar on an element and goes away when you activate it again or it loses
	 * focus. Great for informational popups on those little "i" icons.
	 */
	/**
	 * Whether the tooltip will have interative elements inside.
	 *
	 * Using this lets the browser know that this is an interactive area, not
	 * just an informational tooltip, helping with accessibility.
	 */
	/**
	 * Whether the tooltip should be hidden from users using screen readers.
	 *
	 * You should only use this if the information in the tooltip is either
	 * redundant or unhelpful.
	 */
	/**
	 * The delay before the tooltip is shown when the user hovers.
	 *
	 * Defaults to 500ms.
	 */
	/**
	 * The delay before the tooltip is hidden when the user quits hovering.
	 *
	 * Defaults to 600ms.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * A list of CSS styles.
	 */
	// TODO: figure out why MDC-Web included these caret functions, because they're entirely undocumented.
	// The foundation only watches for blur, which
	// doesn't fire on all components you would
	// anchor a tooltip to (since it doesn't
	// bubble), so we handle focusout like a blur.
	// Purposefully capitalized differently to match MDC.
	// Purposefully capitalized differently to match MDC.
}