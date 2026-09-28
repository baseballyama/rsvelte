import * as $ from 'svelte/internal/server';
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

export default function Dialog($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
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
		let {
			use = [],
			class: className = '',
			open = false,
			selection = false,
			escapeKeyAction = 'close',
			scrimClickAction = 'close',
			autoStackButtons = true,
			fullscreen = false,
			sheet = false,
			noContentPadding = false,
			scrimRemoved = false,
			container$class = '',
			surface$class = '',
			children,
			over,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;
		let instance = void 0;
		let eventManager = new SvelteEventManager();
		let internalClasses = {};
		let focusTrap;
		let actionButtonsReversed = writable(false);
		let fullscreenTitleless = !!fullscreen;
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
		setContext('SMUI:dialog:selection', selection);

		setContext('SMUI:dialog:setFullscreenTitleless', (value) => {
			fullscreenTitleless = value;
		});

		setContext('SMUI:dialog:aboveFullscreen', aboveFullscreen || fullscreen);
		setContext('SMUI:dialog:aboveFullscreenShown', aboveFullscreenShown);

		if (sheet) {
			setContext('SMUI:icon-button:context', 'dialog:sheet');
		}

		if (addLayoutListener) {
			removeLayoutListener = addLayoutListener(layout);
		}

		let previousAboveFullscreenShown = $.store_get($$store_subs ??= {}, '$aboveFullscreenShown', aboveFullscreenShown);

		onMount(() => {
			focusTrap = new FocusTrap(element, { initialFocusEl: getInitialFocusEl() ?? undefined });

			instance = new MDCDialogFoundation({
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
					open = false;
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
			});

			instance.init();

			return () => {
				instance?.destroy();
				instance = undefined;
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
			return open;
		}

		function setOpen(value) {
			open = value;
		}

		function layout() {
			return instance?.layout();
		}

		function getElement() {
			return element;
		}

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(classMap({
				'mdc-dialog': true,
				'mdc-dialog--stacked': !autoStackButtons,
				'mdc-dialog--fullscreen': fullscreen,
				'mdc-dialog--fullscreen--titleless': fullscreenTitleless,
				'mdc-dialog--sheet': sheet,
				'mdc-dialog--no-content-padding': noContentPadding,
				'mdc-dialog--chaining': chaining,
				'smui-dialog--selection': selection,
				...internalClasses,
				[className]: true
			})),
			role: 'alertdialog',
			'aria-modal': 'true',
			...exclude(restProps, ['container$', 'surface$'])
		})}><div${$.attributes({
			class: $.clsx(classMap({ 'mdc-dialog__container': true, [container$class]: true })),
			...prefixFilter(restProps, 'container$')
		})}><div${$.attributes({
			class: $.clsx(classMap({ 'mdc-dialog__surface': true, [surface$class]: true })),
			role: 'alertdialog',
			'aria-modal': 'true',
			tabindex: -1,
			...prefixFilter(restProps, 'surface$')
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----> `);

		if (fullscreen) {
			$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(classMap({
				'mdc-dialog__surface-scrim': true,
				'mdc-dialog__scrim--removed': scrimRemoved
			})))}></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div> <div${$.attr_class($.clsx(classMap({
			'mdc-dialog__scrim': true,
			'mdc-dialog__scrim--removed': scrimRemoved
		})))}></div></div> `);

		over?.($$renderer);
		$$renderer.push(`<!---->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { open, isOpen, setOpen, layout, getElement });
	});
}