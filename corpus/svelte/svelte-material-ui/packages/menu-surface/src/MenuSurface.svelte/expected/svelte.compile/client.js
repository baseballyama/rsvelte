import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, setContext, getContext } from 'svelte';
import { classMap, useActions, dispatch, SvelteEventManager } from '@smui/common/internal';
import { MDCMenuSurfaceFoundation } from './mdc';
import { Corner } from './MenuSurface.types.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'style',
	'static',
	'anchor',
	'fixed',
	'open',
	'managed',
	'fullWidth',
	'quickOpen',
	'anchorElement',
	'anchorCorner',
	'anchorMargin',
	'maxHeight',
	'horizontallyCenteredOnViewport',
	'openBottomBias',
	'neverRestoreFocus',
	'children'
]);

var root = $.from_html(`<div><!></div>`);

export default function MenuSurface($$anchor, $$props) {
	$.push($$props, true);

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
	 * A static menu is always open.
	 */
	/**
	 * Anchor the menu surface automatically to its parent element.
	 *
	 * If you set this to false, you need to provide an element to
	 * `anchorElement`.
	 */
	/**
	 * Set the menu surface calculations based on a fixed position menu.
	 */
	/**
	 * Whether the menu surface is open.
	 */
	/**
	 * A managed menu surface means you completely control the open state. The
	 * component will never alter it on its own.
	 */
	/**
	 * Set width to 100%.
	 */
	/**
	 * Skip animating when the menu surface opens.
	 */
	/**
	 * The element to anchor the menu to, if not done automatically.
	 *
	 * You should only need this if you set `anchor` to false.
	 */
	/**
	 * Default anchor corner alignment of top left menu surface corner.
	 */
	/**
	 * The margin to put between the anchor and the menu.
	 */
	/**
	 * The maximum height to allow the menu surface to be.
	 */
	/**
	 * Whether menu-surface should be horizontally centered to viewport.
	 *
	 * (Only effective when the menu surface is hoisted to the body.)
	 */
	/**
	 * Set to a positive integer to influence the menu to preferentially open
	 * below the anchor instead of above.
	 *
	 * A value of `x` simulates an extra `x` pixels of available space below the
	 * menu during positioning calculations.
	 */
	/**
	 * Set this to true to never restore focus to the previously focused element
	 * when the menu is closed.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		style = $.prop($$props, 'style', 3, ''),
		isStatic = $.prop($$props, 'static', 3, false),
		anchor = $.prop($$props, 'anchor', 3, true),
		fixed = $.prop($$props, 'fixed', 3, false),
		open = $.prop($$props, 'open', 31, () => $.proxy(isStatic())),
		managed = $.prop($$props, 'managed', 3, false),
		fullWidth = $.prop($$props, 'fullWidth', 3, false),
		quickOpen = $.prop($$props, 'quickOpen', 3, false),
		anchorElement = $.prop($$props, 'anchorElement', 15),
		anchorMargin = $.prop($$props, 'anchorMargin', 19, () => ({ top: 0, right: 0, bottom: 0, left: 0 })),
		maxHeight = $.prop($$props, 'maxHeight', 3, 0),
		horizontallyCenteredOnViewport = $.prop($$props, 'horizontallyCenteredOnViewport', 3, false),
		openBottomBias = $.prop($$props, 'openBottomBias', 3, 0),
		neverRestoreFocus = $.prop($$props, 'neverRestoreFocus', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	let instance = $.state(void 0);
	let eventManager = new SvelteEventManager();
	let internalClasses = $.proxy({});
	let internalStyles = $.proxy({});
	let previousFocus = $.state(undefined);

	setContext('SMUI:list:role', 'menu');
	setContext('SMUI:list:item:role', 'menuitem');

	$.user_effect(() => {
		if (element && anchor() && !element.parentElement?.classList.contains('mdc-menu-surface--anchor')) {
			element.parentElement?.classList.add('mdc-menu-surface--anchor');
			anchorElement(element.parentElement ?? undefined);
		}
	});

	$.user_effect(() => {
		if ($.get(instance) && $.get(instance).isOpen() !== open()) {
			if (open()) {
				$.get(instance).open();
			} else {
				$.get(instance).close();
			}
		}
	});

	$.user_effect(() => {
		if ($.get(instance)) {
			$.get(instance).setQuickOpen(quickOpen());
		}
	});

	$.user_effect(() => {
		if ($.get(instance)) {
			$.get(instance).setFixedPosition(fixed());
		}
	});

	$.user_effect(() => {
		if ($.get(instance)) {
			$.get(instance).setMaxHeight(maxHeight());
		}
	});

	$.user_effect(() => {
		if ($.get(instance)) {
			$.get(instance).setIsHorizontallyCenteredOnViewport(horizontallyCenteredOnViewport());
		}
	});

	const iCorner = Corner;

	$.user_effect(() => {
		if ($.get(instance) && $$props.anchorCorner != null) {
			if (typeof $$props.anchorCorner === 'string') {
				$.get(instance).setAnchorCorner(iCorner[$$props.anchorCorner]);
			} else {
				$.get(instance).setAnchorCorner($$props.anchorCorner);
			}
		}
	});

	$.user_effect(() => {
		if ($.get(instance)) {
			$.get(instance).setAnchorMargin(anchorMargin());
		}
	});

	$.user_effect(() => {
		if ($.get(instance)) {
			$.get(instance).setOpenBottomBias(openBottomBias());
		}
	});

	const SMUIMenuSurfaceMount = getContext('SMUI:menu-surface:mount');
	const SMUIMenuSurfaceUnmount = getContext('SMUI:menu-surface:unmount');

	onMount(() => {
		$.set(
			instance,
			new MDCMenuSurfaceFoundation({
				addClass,
				removeClass,
				hasClass,
				hasAnchor: () => !!anchorElement(),
				notifyClose: () => {
					if (!managed()) {
						open(isStatic());
					}

					if (!open() && getElement()) {
						dispatch(getElement(), 'SMUIMenuSurfaceClosed');
					}
				},

				notifyClosing: () => {
					if (!managed()) {
						open(isStatic());
					}

					if (!open() && getElement()) {
						dispatch(getElement(), 'SMUIMenuSurfaceClosing');
					}
				},

				notifyOpen: () => {
					if (!managed()) {
						open(true);
					}

					if (open() && getElement()) {
						dispatch(getElement(), 'SMUIMenuSurfaceOpened');
					}
				},

				notifyOpening: () => {
					if (!open() && getElement()) {
						dispatch(getElement(), 'SMUIMenuSurfaceOpening');
					}
				},
				isElementInContainer: (el) => getElement()?.contains(el) ?? false,
				isRtl: () => getElement() && getComputedStyle(getElement()).getPropertyValue('direction') === 'rtl',
				setTransformOrigin: (origin) => {
					internalStyles['transform-origin'] = origin;
				},
				isFocused: () => document.activeElement === getElement(),
				saveFocus: () => {
					$.set(previousFocus, document.activeElement ?? undefined, true);
				},

				restoreFocus: () => {
					if (!neverRestoreFocus() && (!element || getElement()?.contains(document.activeElement)) && $.get(previousFocus) && document.contains($.get(previousFocus)) && 'focus' in $.get(previousFocus)) {
						$.get(previousFocus).focus();
					}
				},

				getInnerDimensions: () => {
					return {
						width: getElement()?.offsetWidth ?? 0,
						height: getElement()?.offsetHeight ?? 0
					};
				},
				getAnchorDimensions: () => anchorElement() ? anchorElement().getBoundingClientRect() : null,
				getViewportDimensions: () => {
					return { width: window.innerWidth, height: window.innerHeight };
				},

				getBodyDimensions: () => {
					return {
						width: document.body.clientWidth,
						height: document.body.clientHeight
					};
				},

				getWindowScroll: () => {
					return { x: window.pageXOffset, y: window.pageYOffset };
				},

				setPosition: (position) => {
					internalStyles.left = 'left' in position ? `${position.left}px` : '';
					internalStyles.right = 'right' in position ? `${position.right}px` : '';
					internalStyles.top = 'top' in position ? `${position.top}px` : '';
					internalStyles.bottom = 'bottom' in position ? `${position.bottom}px` : '';
				},

				setMaxHeight: (height) => {
					internalStyles['max-height'] = height;
				},
				registerWindowEventHandler: (evt, handler) => eventManager.on(window, evt, handler),
				deregisterWindowEventHandler: (evt, handler) => eventManager.off(window, evt, handler)
			}),
			true
		);

		const accessor = {
			get open() {
				return open();
			},

			set open(value) {
				open(value);
			},
			closeProgrammatic
		};

		SMUIMenuSurfaceMount && SMUIMenuSurfaceMount(accessor);
		$.get(instance).init();

		return () => {
			SMUIMenuSurfaceUnmount && SMUIMenuSurfaceUnmount(accessor);

			if (anchor()) {
				getElement() && getElement().parentElement?.classList.remove('mdc-menu-surface--anchor');
			}

			const isHoisted = $.get(instance).isHoistedElement;

			$.get(instance)?.destroy();
			$.set(instance, undefined);

			if (isHoisted) {
				try {
					getElement()?.parentNode?.removeChild(getElement());
				} catch(e) {
					// Ignore error.
				}
			}
		};
	});

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

	function closeProgrammatic(skipRestoreFocus) {
		$.get(instance)?.close(skipRestoreFocus);
		open(false);
	}

	function handleBodyClick(event) {
		if ($.get(instance) && open() && !managed()) {
			$.get(instance).handleBodyClick(event);
		}
	}

	function isOpen() {
		return open();
	}

	function setOpen(value) {
		open(value);
	}

	function setAbsolutePosition(x, y) {
		if ($.get(instance) == null) {
			throw new Error('Instance is not defined.');
		}

		return $.get(instance).setAbsolutePosition(x, y);
	}

	function setIsHoisted(isHoisted) {
		if ($.get(instance) == null) {
			throw new Error('Instance is not defined.');
		}

		return $.get(instance).setIsHoisted(isHoisted);
	}

	function isFixed() {
		if ($.get(instance) == null) {
			throw new Error('Instance is not defined.');
		}

		return $.get(instance).isFixed();
	}

	function flipCornerHorizontally() {
		if ($.get(instance) == null) {
			throw new Error('Instance is not defined.');
		}

		return $.get(instance).flipCornerHorizontally();
	}

	function getElement() {
		return element;
	}

	var $$exports = {
		isOpen,
		setOpen,
		setAbsolutePosition,
		setIsHoisted,
		isFixed,
		flipCornerHorizontally,
		getElement
	};

	var div = root();

	$.event('click', $.document.body, handleBodyClick, true);

	var event_handler = (e) => {
		if ($.get(instance) && !managed()) {
			$.get(instance).handleKeydown(e);
		}

		$$props.onkeydown?.(e);
	};

	$.attribute_effect(
		div,
		($0, $1) => ({
			class: $0,
			style: $1,
			role: 'dialog',
			...restProps,
			onkeydown: event_handler
		}),
		[
			() => classMap({
				'mdc-menu-surface': true,
				'mdc-menu-surface--fixed': fixed(),
				'mdc-menu-surface--open': isStatic(),
				'smui-menu-surface--static': isStatic(),
				'mdc-menu-surface--fullwidth': fullWidth(),
				...internalClasses,
				[className()]: true
			}),
			() => Object.entries(internalStyles).map(([name, value]) => `${name}: ${value};`).concat([style()]).join(' ')
		]
	);

	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.bind_this(div, ($$value) => element = $$value, () => element);
	$.action(div, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
	$.append($$anchor, div);

	return $.pop($$exports);
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
	 * A static menu is always open.
	 */
	/**
	 * Anchor the menu surface automatically to its parent element.
	 *
	 * If you set this to false, you need to provide an element to
	 * `anchorElement`.
	 */
	/**
	 * Set the menu surface calculations based on a fixed position menu.
	 */
	/**
	 * Whether the menu surface is open.
	 */
	/**
	 * A managed menu surface means you completely control the open state. The
	 * component will never alter it on its own.
	 */
	/**
	 * Set width to 100%.
	 */
	/**
	 * Skip animating when the menu surface opens.
	 */
	/**
	 * The element to anchor the menu to, if not done automatically.
	 *
	 * You should only need this if you set `anchor` to false.
	 */
	/**
	 * Default anchor corner alignment of top left menu surface corner.
	 */
	/**
	 * The margin to put between the anchor and the menu.
	 */
	/**
	 * The maximum height to allow the menu surface to be.
	 */
	/**
	 * Whether menu-surface should be horizontally centered to viewport.
	 *
	 * (Only effective when the menu surface is hoisted to the body.)
	 */
	/**
	 * Set to a positive integer to influence the menu to preferentially open
	 * below the anchor instead of above.
	 *
	 * A value of `x` simulates an extra `x` pixels of available space below the
	 * menu during positioning calculations.
	 */
	/**
	 * Set this to true to never restore focus to the previously focused element
	 * when the menu is closed.
	 */
	// Ignore error.
}