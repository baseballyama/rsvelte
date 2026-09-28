import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { readable } from 'svelte/store';
import { classMap, useActions, dispatch, SvelteEventManager } from '@smui/common/internal';

import {
	MDCTopAppBarBaseFoundation,
	MDCTopAppBarFoundation,
	MDCFixedTopAppBarFoundation,
	MDCShortTopAppBarFoundation
} from './mdc';

export default function TopAppBar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let uninitializedValue = () => {};

		function isUninitializedValue(value) {
			return value === uninitializedValue;
		}

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
		/**
		 * When using short variant, whether the app bar is collapsed.
		 */
		/**
		 * Whether to style the app bar as prominent.
		 */
		/**
		 * Whether to style the app bar more densely.
		 */
		/**
		 * You can specify the scroll target if needed.
		 */
		let {
			use = [],
			class: className = '',
			style = '',
			variant = 'standard',
			color = 'primary',
			collapsed = uninitializedValue,
			prominent = false,
			dense = false,
			scrollTarget,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		// Some trickery to detect uninitialized values but also have the right types.
		const alwaysCollapsed = !isUninitializedValue(collapsed) && !!collapsed;

		if (isUninitializedValue(collapsed)) {
			collapsed = false;
		}

		// Done with the trickery.
		let element;

		let instance = void 0;
		let eventManager = new SvelteEventManager();
		let internalClasses = {};
		let internalStyles = {};
		let propStoreSet = void 0;

		let propStore = readable({ variant, prominent, dense }, (set) => {
			propStoreSet = set;
		});

		let oldScrollTarget = undefined;
		let oldVariant = variant;

		onMount(() => {
			instance = getInstance();
			instance.init();

			return () => {
				instance?.destroy();
				instance = undefined;
				eventManager.clear();
			};
		});

		function getInstance() {
			const Foundation = ({
				static: MDCTopAppBarBaseFoundation,
				short: MDCShortTopAppBarFoundation,
				fixed: MDCFixedTopAppBarFoundation,
				standard: MDCTopAppBarFoundation
			})[variant] || MDCTopAppBarFoundation;

			return new Foundation({
				hasClass,
				addClass,
				removeClass,
				setStyle: addStyle,
				getTopAppBarHeight: () => getElement().clientHeight,
				notifyNavigationIconClicked: () => dispatch(getElement(), 'SMUITopAppBarNav'),
				getViewportScrollY: () => scrollTarget == null ? window.pageYOffset : scrollTarget.scrollTop,
				getTotalActionItems: () => getElement().querySelectorAll('.mdc-top-app-bar__action-item').length
			});
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

		function handleTargetScroll() {
			if (instance) {
				instance.handleTargetScroll();

				if (variant === 'short') {
					collapsed = 'isCollapsed' in instance && instance.isCollapsed;
				}
			}
		}

		function getPropStore() {
			return propStore;
		}

		function getElement() {
			return element;
		}

		$$renderer.push(`<header${$.attributes({
			class: $.clsx(classMap({
				'mdc-top-app-bar': true,
				'mdc-top-app-bar--short': variant === 'short',
				'mdc-top-app-bar--short-collapsed': collapsed,
				'mdc-top-app-bar--fixed': variant === 'fixed',
				'smui-top-app-bar--static': variant === 'static',
				'smui-top-app-bar--color-secondary': color === 'secondary',
				'mdc-top-app-bar--prominent': prominent,
				'mdc-top-app-bar--dense': dense,
				...internalClasses,
				[className]: true
			})),
			style: Object.entries(internalStyles).map(([name, value]) => `${name}: ${value};`).concat([style]).join(' '),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></header>`);
		$.bind_props($$props, { collapsed, getPropStore, getElement });
	});
}