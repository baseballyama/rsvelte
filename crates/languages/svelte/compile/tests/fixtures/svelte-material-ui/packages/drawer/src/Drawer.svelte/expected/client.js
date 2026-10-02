import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, setContext } from 'svelte';
import { focusTrap as domFocusTrap } from '@smui/common/dom';
import { classMap, useActions, dispatch, SvelteEventManager } from '@smui/common/internal';
import { MDCDismissibleDrawerFoundation, MDCModalDrawerFoundation } from './mdc';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'variant',
	'open',
	'fixed',
	'children'
]);

var root = $.from_html(`<aside><!></aside>`);

export default function Drawer($$anchor, $$props) {
	$.push($$props, true);

	const { FocusTrap } = domFocusTrap;

	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * How the drawer opens.
	 *
	 * Undefined means it's always open.
	 *
	 * Dismissible means it pushes the content over when it opens.
	 *
	 * Modal means it uses a scrim to open over the content.
	 */
	/**
	 * When using a dismissible or modal drawer, controls whether it's open.
	 */
	/**
	 * Turn this off for non-page-wide drawers.
	 *
	 * This controls whether the drawer uses fixed or absolute positioning.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		open = $.prop($$props, 'open', 15, false),
		fixed = $.prop($$props, 'fixed', 3, true),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	let instance = $.state(undefined);
	let eventManager = new SvelteEventManager();
	let internalClasses = $.state($.proxy({}));
	let previousFocus = $.state(null);
	let focusTrap;
	let scrim = $.state(false);

	setContext('SMUI:list:nav', true);
	setContext('SMUI:list:item:nav', true);
	setContext('SMUI:list:wrapFocus', true);

	$.user_effect(() => {
		if ($.get(instance) && $.get(instance).isOpen() !== open()) {
			if (open()) {
				$.get(instance).open();
			} else {
				$.get(instance).close();
			}
		}
	});

	let oldVariant = $$props.variant;

	$.user_effect(() => {
		if (oldVariant !== $$props.variant) {
			oldVariant = $$props.variant;
			$.get(instance)?.destroy();
			$.set(instance, undefined);
			$.set(internalClasses, {}, true);
			$.set(instance, getInstance(), true);
			$.get(instance)?.init();
		}
	});

	onMount(() => {
		focusTrap = new FocusTrap(element, {
			// Component handles focusing on active nav item.
			skipInitialFocus: true
		});

		$.set(instance, getInstance(), true);
		$.get(instance)?.init();

		return () => {
			$.get(instance)?.destroy();
			$.set(instance, undefined);
			$.get(scrim) && eventManager.off($.get(scrim), 'SMUIDrawerScrimClick', handleScrimClick);
			eventManager.clear();
		};
	});

	function getInstance() {
		if ($.get(scrim)) {
			eventManager.off($.get(scrim), 'SMUIDrawerScrimClick', handleScrimClick);
			$.set(scrim, false);
		}

		if ($$props.variant === 'modal') {
			$.set(scrim, getElement().parentNode?.querySelector('.mdc-drawer-scrim') ?? false, true);

			if ($.get(scrim)) {
				eventManager.on($.get(scrim), 'SMUIDrawerScrimClick', handleScrimClick);
			}
		}

		const Foundation = $$props.variant === 'dismissible'
			? MDCDismissibleDrawerFoundation
			: $$props.variant === 'modal' ? MDCModalDrawerFoundation : undefined;

		return Foundation
			? new Foundation({
				addClass,
				removeClass,
				hasClass,
				elementHasClass: (element, className) => element.classList.contains(className),
				saveFocus: () => $.set(previousFocus, document.activeElement, true),
				restoreFocus: () => {
					if ($.get(previousFocus) && 'focus' in $.get(previousFocus) && getElement().contains(document.activeElement)) {
						$.get(previousFocus).focus();
					}
				},

				focusActiveNavigationItem: () => {
					const activeNavItemEl = getElement().querySelector('.mdc-list-item--activated,.mdc-deprecated-list-item--activated');

					if (activeNavItemEl) {
						activeNavItemEl.focus();
					}
				},

				notifyClose: () => {
					open(false);
					dispatch(getElement(), 'SMUIDrawerClosed');
				},

				notifyOpen: () => {
					open(true);
					dispatch(getElement(), 'SMUIDrawerOpened');
				},
				trapFocus: () => focusTrap.trapFocus(),
				releaseFocus: () => focusTrap.releaseFocus()
			})
			: undefined;
	}

	function hasClass(className) {
		return className in $.get(internalClasses)
			? $.get(internalClasses)[className]
			: getElement().classList.contains(className);
	}

	function addClass(className) {
		if (!$.get(internalClasses)[className]) {
			$.get(internalClasses)[className] = true;
		}
	}

	function removeClass(className) {
		if (!(className in $.get(internalClasses)) || $.get(internalClasses)[className]) {
			$.get(internalClasses)[className] = false;
		}
	}

	function handleScrimClick() {
		$.get(instance) && 'handleScrimClick' in $.get(instance) && $.get(instance).handleScrimClick();
	}

	function setOpen(value) {
		open(value);
	}

	function isOpen() {
		return open();
	}

	function getElement() {
		return element;
	}

	var $$exports = { setOpen, isOpen, getElement };
	var aside = root();

	var event_handler = (e) => {
		if ($.get(instance)) {
			$.get(instance).handleKeydown(e);
		}

		$$props.onkeydown?.(e);
	};

	var event_handler_1 = (e) => {
		if ($.get(instance)) {
			$.get(instance).handleTransitionEnd(e);
		}

		$$props.ontransitionend?.(e);
	};

	$.attribute_effect(
		aside,
		($0) => ({
			class: $0,
			...restProps,
			onkeydown: event_handler,
			ontransitionend: event_handler_1
		}),
		[
			() => classMap({
				'mdc-drawer': true,
				'mdc-drawer--dismissible': $$props.variant === 'dismissible',
				'mdc-drawer--modal': $$props.variant === 'modal',
				'smui-drawer__absolute': $$props.variant === 'modal' && !fixed(),
				...$.get(internalClasses),
				[className()]: true
			})
		]
	);

	var node = $.child(aside);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(aside);
	$.bind_this(aside, ($$value) => element = $$value, () => element);
	$.action(aside, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
	$.append($$anchor, aside);

	return $.pop($$exports);
	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * How the drawer opens.
	 *
	 * Undefined means it's always open.
	 *
	 * Dismissible means it pushes the content over when it opens.
	 *
	 * Modal means it uses a scrim to open over the content.
	 */
	/**
	 * When using a dismissible or modal drawer, controls whether it's open.
	 */
	/**
	 * Turn this off for non-page-wide drawers.
	 *
	 * This controls whether the drawer uses fixed or absolute positioning.
	 */
	// Component handles focusing on active nav item.
}