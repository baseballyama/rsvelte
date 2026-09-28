import * as $ from 'svelte/internal/server';
import { onMount, setContext } from 'svelte';
import { focusTrap as domFocusTrap } from '@smui/common/dom';
import { classMap, useActions, dispatch, SvelteEventManager } from '@smui/common/internal';
import { MDCDismissibleDrawerFoundation, MDCModalDrawerFoundation } from './mdc';

export default function Drawer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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
		let {
			use = [],
			class: className = '',
			variant,
			open = false,
			fixed = true,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;
		let instance = undefined;
		let eventManager = new SvelteEventManager();
		let internalClasses = {};
		let previousFocus = null;
		let focusTrap;
		let scrim = false;

		setContext('SMUI:list:nav', true);
		setContext('SMUI:list:item:nav', true);
		setContext('SMUI:list:wrapFocus', true);

		let oldVariant = variant;

		onMount(() => {
			focusTrap = new FocusTrap(element, {
				// Component handles focusing on active nav item.
				skipInitialFocus: true
			});

			instance = getInstance();
			instance?.init();

			return () => {
				instance?.destroy();
				instance = undefined;
				scrim && eventManager.off(scrim, 'SMUIDrawerScrimClick', handleScrimClick);
				eventManager.clear();
			};
		});

		function getInstance() {
			if (scrim) {
				eventManager.off(scrim, 'SMUIDrawerScrimClick', handleScrimClick);
				scrim = false;
			}

			if (variant === 'modal') {
				scrim = getElement().parentNode?.querySelector('.mdc-drawer-scrim') ?? false;

				if (scrim) {
					eventManager.on(scrim, 'SMUIDrawerScrimClick', handleScrimClick);
				}
			}

			const Foundation = variant === 'dismissible'
				? MDCDismissibleDrawerFoundation
				: variant === 'modal' ? MDCModalDrawerFoundation : undefined;

			return Foundation
				? new Foundation({
					addClass,
					removeClass,
					hasClass,
					elementHasClass: (element, className) => element.classList.contains(className),
					saveFocus: () => previousFocus = document.activeElement,
					restoreFocus: () => {
						if (previousFocus && 'focus' in previousFocus && getElement().contains(document.activeElement)) {
							previousFocus.focus();
						}
					},

					focusActiveNavigationItem: () => {
						const activeNavItemEl = getElement().querySelector('.mdc-list-item--activated,.mdc-deprecated-list-item--activated');

						if (activeNavItemEl) {
							activeNavItemEl.focus();
						}
					},

					notifyClose: () => {
						open = false;
						dispatch(getElement(), 'SMUIDrawerClosed');
					},

					notifyOpen: () => {
						open = true;
						dispatch(getElement(), 'SMUIDrawerOpened');
					},
					trapFocus: () => focusTrap.trapFocus(),
					releaseFocus: () => focusTrap.releaseFocus()
				})
				: undefined;
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

		function handleScrimClick() {
			instance && 'handleScrimClick' in instance && instance.handleScrimClick();
		}

		function setOpen(value) {
			open = value;
		}

		function isOpen() {
			return open;
		}

		function getElement() {
			return element;
		}

		$$renderer.push(`<aside${$.attributes({
			class: $.clsx(classMap({
				'mdc-drawer': true,
				'mdc-drawer--dismissible': variant === 'dismissible',
				'mdc-drawer--modal': variant === 'modal',
				'smui-drawer__absolute': variant === 'modal' && !fixed,
				...internalClasses,
				[className]: true
			})),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></aside>`);
		$.bind_props($$props, { open, setOpen, isOpen, getElement });
	});
}