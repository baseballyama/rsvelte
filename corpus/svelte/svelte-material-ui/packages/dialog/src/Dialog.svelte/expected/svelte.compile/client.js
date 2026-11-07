import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, onDestroy, getContext, setContext } from 'svelte';
import { writable } from 'svelte/store';
import { focusTrap as domFocusTrap, ponyfill } from '@smui/common/dom';

import {
	classMap,
	exclude,
	prefixFilter,
	useActions,
	dispatch,
	SvelteEventManager
} from '@smui/common/internal';

import { MDCDialogFoundation, util } from './mdc';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'open',
	'selection',
	'escapeKeyAction',
	'scrimClickAction',
	'autoStackButtons',
	'fullscreen',
	'sheet',
	'noContentPadding',
	'scrimRemoved',
	'container$class',
	'surface$class',
	'children',
	'over'
]);

var root = $.from_html(`<div></div>`);
var root_1 = $.from_html(`<div><div><div><!> <!></div></div> <div></div></div> <!>`, 1);

export default function Dialog($$anchor, $$props) {
	$.push($$props, true);

	const $actionButtonsReversed = () => $.store_get(actionButtonsReversed, '$actionButtonsReversed', $$stores);
	const $aboveFullscreenShown = () => $.store_get(aboveFullscreenShown, '$aboveFullscreenShown', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { FocusTrap } = domFocusTrap;
	const { closest, matches } = ponyfill;

	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * Whether the dialog is open.
	 */
	/**
	 * Whether this is a selection dialog.
	 */
	/**
	 * What action the escape key should trigger.
	 *
	 * Set to an empty string to not trigger an action or close the dialog.
	 */
	/**
	 * What action clicking the scrim should trigger.
	 *
	 * Set to an empty string to not trigger an action or close the dialog.
	 */
	/**
	 * Automatically stack buttons that are too wide on mobile screens.
	 */
	/**
	 * Style as a full screen dialog on mobile screens.
	 */
	/**
	 * Style as a floating sheet.
	 *
	 * Floating sheets are dialogs with a close icon button. Clicking the close
	 * icon button closes the sheet. Having the close icon button is mutually
	 * exclusive with having action bar buttons (e.g. cancel and OK buttons).
	 * The icon button is absolutely positioned.
	 */
	/**
	 * Don't pad the content.
	 */
	/**
	 * Remove the scrim.
	 *
	 * When true, remove semitransparent backdrop behind dialog and allow
	 * pointer on a content behind a dialog.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * A spot to render another dialog over this one.
	 *
	 * According to the Material spec, you should only use this to put a choice
	 * dialog over a fullscreen dialog.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		open = $.prop($$props, 'open', 15, false),
		selection = $.prop($$props, 'selection', 3, false),
		escapeKeyAction = $.prop($$props, 'escapeKeyAction', 3, 'close'),
		scrimClickAction = $.prop($$props, 'scrimClickAction', 3, 'close'),
		autoStackButtons = $.prop($$props, 'autoStackButtons', 3, true),
		fullscreen = $.prop($$props, 'fullscreen', 3, false),
		sheet = $.prop($$props, 'sheet', 3, false),
		noContentPadding = $.prop($$props, 'noContentPadding', 3, false),
		scrimRemoved = $.prop($$props, 'scrimRemoved', 3, false),
		container$class = $.prop($$props, 'container$class', 3, ''),
		surface$class = $.prop($$props, 'surface$class', 3, ''),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	let instance = $.state(void 0);
	let eventManager = new SvelteEventManager();
	let internalClasses = $.proxy({});
	let focusTrap;
	let actionButtonsReversed = writable(false);
	let fullscreenTitleless = $.state(!!fullscreen());
	let aboveFullscreen = getContext('SMUI:dialog:aboveFullscreen');
	let chaining = !!getContext('SMUI:dialog:chaining');
	let aboveFullscreenShown = getContext('SMUI:dialog:aboveFullscreenShown') ?? writable(false);
	let addLayoutListener = getContext('SMUI:addLayoutListener');
	let removeLayoutListener;
	let layoutListeners = [];

	let addLayoutListenerFn = (listener) => {
		layoutListeners.push(listener);

		return () => {
			const idx = layoutListeners.indexOf(listener);

			if (idx >= 0) {
				layoutListeners.splice(idx, 1);
			}
		};
	};

	setContext('SMUI:dialog:chaining', true);
	setContext('SMUI:dialog:actions:reversed', actionButtonsReversed);
	setContext('SMUI:addLayoutListener', addLayoutListenerFn);
	setContext('SMUI:dialog:selection', selection());

	setContext('SMUI:dialog:setFullscreenTitleless', (value) => {
		$.set(fullscreenTitleless, value, true);
	});

	setContext('SMUI:dialog:aboveFullscreen', aboveFullscreen || fullscreen());
	setContext('SMUI:dialog:aboveFullscreenShown', aboveFullscreenShown);

	if (sheet()) {
		setContext('SMUI:icon-button:context', 'dialog:sheet');
	}

	$.user_effect(() => {
		if ($.get(instance) && $.get(instance).getEscapeKeyAction() !== escapeKeyAction()) {
			$.get(instance).setEscapeKeyAction(escapeKeyAction());
		}
	});

	$.user_effect(() => {
		if ($.get(instance) && $.get(instance).getScrimClickAction() !== scrimClickAction()) {
			$.get(instance).setScrimClickAction(scrimClickAction());
		}
	});

	$.user_effect(() => {
		if ($.get(instance) && $.get(instance).getAutoStackButtons() !== autoStackButtons()) {
			$.get(instance).setAutoStackButtons(autoStackButtons());
		}
	});

	$.user_effect(() => {
		if (!autoStackButtons()) {
			$.store_set(actionButtonsReversed, true);
		}
	});

	if (addLayoutListener) {
		removeLayoutListener = addLayoutListener(layout);
	}

	$.user_effect(() => {
		if ($.get(instance) && $.get(instance).isOpen() !== open()) {
			if (open()) {
				$.get(instance).open({ isAboveFullscreenDialog: !!aboveFullscreen });
			} else {
				$.get(instance).close();
			}
		}
	});

	let previousAboveFullscreenShown = $aboveFullscreenShown();

	$.user_effect(() => {
		if (fullscreen() && $.get(instance) && previousAboveFullscreenShown !== $aboveFullscreenShown()) {
			previousAboveFullscreenShown = $aboveFullscreenShown();

			if ($aboveFullscreenShown()) {
				$.get(instance).showSurfaceScrim();
			} else {
				$.get(instance).hideSurfaceScrim();
			}
		}
	});

	onMount(() => {
		focusTrap = new FocusTrap(element, { initialFocusEl: getInitialFocusEl() ?? undefined });

		$.set(
			instance,
			new MDCDialogFoundation({
				addBodyClass: (className) => document.body.classList.add(className),
				addClass,
				areButtonsStacked: () => util.areTopsMisaligned(getButtonEls()),
				clickDefaultButton: () => {
					const defaultButton = getDefaultButtonEl();

					if (defaultButton) {
						defaultButton.click();
					}
				},
				eventTargetMatches: (target, selector) => target ? matches(target, selector) : false,
				getActionFromEvent: (evt) => {
					if (!evt.target) {
						return '';
					}

					const element = closest(evt.target, '[data-mdc-dialog-action]');

					return element && element.getAttribute('data-mdc-dialog-action');
				},
				getInitialFocusEl,
				hasClass,
				isContentScrollable: () => util.isScrollable(getContentEl()),
				notifyClosed: (action) => {
					open(false);
					dispatch(getElement(), 'SMUIDialogClosed', action ? { action } : {});
				},
				notifyClosing: (action) => dispatch(getElement(), 'SMUIDialogClosing', action ? { action } : {}),
				notifyOpened: () => dispatch(getElement(), 'SMUIDialogOpened', {}),
				notifyOpening: () => dispatch(getElement(), 'SMUIDialogOpening', {}),
				releaseFocus: () => focusTrap.releaseFocus(),
				removeBodyClass: (className) => document.body.classList.remove(className),
				removeClass,
				reverseButtons: () => {
					$.store_set(actionButtonsReversed, true);
				},
				trapFocus: () => focusTrap.trapFocus(),
				registerContentEventHandler: (evt, handler) => {
					const content = getContentEl();

					if (content instanceof HTMLElement) {
						eventManager.on(content, evt, handler);
					}
				},

				deregisterContentEventHandler: (evt, handler) => {
					const content = getContentEl();

					if (content instanceof HTMLElement) {
						eventManager.off(content, evt, handler);
					}
				},

				isScrollableContentAtTop: () => {
					return util.isScrollAtTop(getContentEl());
				},

				isScrollableContentAtBottom: () => {
					return util.isScrollAtBottom(getContentEl());
				},
				registerWindowEventHandler: (evt, handler) => eventManager.on(window, evt, handler),
				deregisterWindowEventHandler: (evt, handler) => eventManager.off(window, evt, handler)
			}),
			true
		);

		$.get(instance).init();

		return () => {
			$.get(instance)?.destroy();
			$.set(instance, undefined);
			eventManager.clear();
		};
	});

	onDestroy(() => {
		if (removeLayoutListener) {
			removeLayoutListener();
		}
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

	function getButtonEls() {
		return [].slice.call(getElement().querySelectorAll('.mdc-dialog__button'));
	}

	function getDefaultButtonEl() {
		return getElement().querySelector('[data-mdc-dialog-button-default]');
	}

	function getContentEl() {
		return getElement().querySelector('.mdc-dialog__content');
	}

	function getInitialFocusEl() {
		return getElement().querySelector('[data-mdc-dialog-initial-focus]');
	}

	function handleDialogOpening() {
		if (aboveFullscreen) {
			$.store_set(aboveFullscreenShown, true);
		}

		requestAnimationFrame(() => {
			layoutListeners.forEach((listener) => listener());
		});
	}

	function handleDialogOpened() {
		layoutListeners.forEach((listener) => listener());
	}

	function handleDialogClosed() {
		if (aboveFullscreen) {
			$.store_set(aboveFullscreenShown, false);
		}
	}

	function isOpen() {
		return open();
	}

	function setOpen(value) {
		open(value);
	}

	function layout() {
		return $.get(instance)?.layout();
	}

	function getElement() {
		return element;
	}

	var $$exports = { isOpen, setOpen, layout, getElement };
	var fragment = root_1();

	$.event('resize', $.window, () => open() && $.get(instance) && $.get(instance).layout());
	$.event('orientationchange', $.window, () => open() && $.get(instance) && $.get(instance).layout());
	$.event('keydown', $.document.body, (e) => $.get(instance) && $.get(instance).handleDocumentKeydown(e));

	var div = $.first_child(fragment);

	var event_handler = (e) => {
		handleDialogOpening();
		$$props.onSMUIDialogOpening?.(e);
	};

	var event_handler_1 = (e) => {
		handleDialogOpened();
		$$props.onSMUIDialogOpened?.(e);
	};

	var event_handler_2 = (e) => {
		handleDialogClosed();
		$$props.onSMUIDialogClosed?.(e);
	};

	var event_handler_3 = (e) => {
		if ($.get(instance)) {
			$.get(instance).handleClick(e);
		}

		$$props.onclick?.(e);
	};

	var event_handler_4 = (e) => {
		if ($.get(instance)) {
			$.get(instance).handleKeydown(e);
		}

		$$props.onkeydown?.(e);
	};

	$.attribute_effect(
		div,
		($0, $1) => ({
			class: $0,
			role: 'alertdialog',
			'aria-modal': 'true',
			...$1,
			onSMUIDialogOpening: event_handler,
			onSMUIDialogOpened: event_handler_1,
			onSMUIDialogClosed: event_handler_2,
			onclick: event_handler_3,
			onkeydown: event_handler_4
		}),
		[
			() => classMap({
				'mdc-dialog': true,
				'mdc-dialog--stacked': !autoStackButtons(),
				'mdc-dialog--fullscreen': fullscreen(),
				'mdc-dialog--fullscreen--titleless': $.get(fullscreenTitleless),
				'mdc-dialog--sheet': sheet(),
				'mdc-dialog--no-content-padding': noContentPadding(),
				'mdc-dialog--chaining': chaining,
				'smui-dialog--selection': selection(),
				...internalClasses,
				[className()]: true
			}),
			() => exclude(restProps, ['container$', 'surface$'])
		]
	);

	var div_1 = $.child(div);

	$.attribute_effect(div_1, ($0, $1) => ({ class: $0, ...$1 }), [
		() => classMap({ 'mdc-dialog__container': true, [container$class()]: true }),
		() => prefixFilter(restProps, 'container$')
	]);

	var div_2 = $.child(div_1);

	$.attribute_effect(
		div_2,
		($0, $1) => ({
			class: $0,
			role: 'alertdialog',
			'aria-modal': 'true',
			tabindex: -1,
			...$1
		}),
		[
			() => classMap({ 'mdc-dialog__surface': true, [surface$class()]: true }),
			() => prefixFilter(restProps, 'surface$')
		]
	);

	var node = $.child(div_2);

	$.snippet(node, () => $$props.children ?? $.noop);

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var div_3 = root();

			$.template_effect(($0) => $.set_class(div_3, 1, $0), [
				() => $.clsx(classMap({
					'mdc-dialog__surface-scrim': true,
					'mdc-dialog__scrim--removed': scrimRemoved()
				}))
			]);

			$.event('transitionend', div_3, () => $.get(instance) && $.get(instance).handleSurfaceScrimTransitionEnd());
			$.append($$anchor, div_3);
		};

		$.if(node_1, ($$render) => {
			if (fullscreen()) $$render(consequent);
		});
	}

	$.reset(div_2);
	$.reset(div_1);

	var div_4 = $.sibling(div_1, 2);

	$.reset(div);
	$.bind_this(div, ($$value) => element = $$value, () => element);
	$.action(div, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);

	var node_2 = $.sibling(div, 2);

	$.snippet(node_2, () => $$props.over ?? $.noop);

	$.template_effect(($0) => $.set_class(div_4, 1, $0), [
		() => $.clsx(classMap({
			'mdc-dialog__scrim': true,
			'mdc-dialog__scrim--removed': scrimRemoved()
		}))
	]);

	$.append($$anchor, fragment);

	var $$pop = $.pop($$exports);

	$$cleanup();

	return $$pop;
}