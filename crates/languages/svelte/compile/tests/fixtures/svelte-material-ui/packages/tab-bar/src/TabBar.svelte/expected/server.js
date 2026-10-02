import * as $ from 'svelte/internal/server';
import { onMount, setContext } from 'svelte';
import { classMap, exclude, prefixFilter, useActions, dispatch } from '@smui/common/internal';
import TabScroller from '@smui/tab-scroller';
import { MDCTabBarFoundation } from './mdc';

export default function TabBar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		/**
		 * An array of tab objects.
		 */
		/**
		 * A function that takes a tab object and returns a unique string or number.
		 *
		 * If your tabs are strings or numbers, you don't need this.
		 */
		/**
		 * Whether tabs should focus themselves when activated by the user.
		 *
		 * The user will always set focus to the tab when they click on it or tab to
		 * it. Setting this to false just means that the user will focus on the tab
		 * when they click on it like always, but will not focus the next tab if
		 * they hit the right arrow key like they normally would.
		 */
		/**
		 * Whether tabs should focus themselves when activated programmatically.
		 */
		/**
		 * Switches between automatic and manual activation modes.
		 */
		/**
		 * The tab that is currently active.
		 */
		/**
		 * The tab index of the control.
		 *
		 * (This is the element's tabindex attribute, as in the index when cycling
		 * focus with the Tab key, not anything to do with the tabs.)
		 */
		let {
			use = [],
			class: className = '',
			tabs = [],
			key = (tab) => tab,
			focusOnActivate = true,
			focusOnProgrammatic = false,
			useAutomaticActivation = true,
			active = void 0,
			tabindex = 0,
			tab,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;
		let instance = void 0;
		let tabScroller;

		let activeIndex = active == null
			? -1
			: tabs.findIndex((tab) => active && key(tab) === key(active));

		let tabAccessorMap = {};
		let tabAccessorWeakMap = new WeakMap();
		let skipFocus = false;

		setContext('SMUI:tab:focusOnActivate', focusOnActivate);
		setContext('SMUI:tab:initialActive', { active: active == null ? null : key(active), key });

		// Manually get the accessor so it is reactive.
		let setUseAutomaticActivation = false;

		setContext('SMUI:tab:mount', (accessor) => {
			addAccessor(accessor.tabId, accessor);
		});

		setContext('SMUI:tab:unmount', (accessor) => {
			removeAccessor(accessor.tabId);
		});

		onMount(() => {
			instance = new MDCTabBarFoundation({
				scrollTo: (scrollX) => tabScroller.scrollTo(scrollX),
				incrementScroll: (scrollXIncrement) => tabScroller.incrementScroll(scrollXIncrement),
				getScrollPosition: () => tabScroller.getScrollPosition(),
				getScrollContentWidth: () => tabScroller.getScrollContentWidth(),
				getOffsetWidth: () => getElement().offsetWidth,
				isRTL: () => getComputedStyle(getElement()).getPropertyValue('direction') === 'rtl',
				setActiveTab: (index) => {
					active = tabs[index];
					activeIndex = index;
					instance?.activateTab(index);
				},
				activateTabAtIndex: (index, clientRect) => getAccessor(tabs[index])?.activate(clientRect, skipFocus),
				deactivateTabAtIndex: (index) => getAccessor(tabs[index])?.deactivate(),
				focusTabAtIndex: (index) => getAccessor(tabs[index])?.focus(),
				getTabIndicatorClientRectAtIndex: (index) => getAccessor(tabs[index])?.computeIndicatorClientRect() ?? new DOMRect(),
				getTabDimensionsAtIndex: (index) => getAccessor(tabs[index])?.computeDimensions() ?? { rootLeft: 0, rootRight: 0, contentLeft: 0, contentRight: 0 },
				getPreviousActiveTabIndex: () => {
					for (let i = 0; i < tabs.length; i++) {
						if (getAccessor(tabs[i])?.active) {
							return i;
						}
					}

					return -1;
				},

				getFocusedTabIndex: () => {
					const tabElements = tabs.map((tab) => getAccessor(tab)?.element);
					const activeElement = document.activeElement;

					return tabElements.indexOf(activeElement);
				},
				getIndexOfTabById: (id) => tabs.findIndex((tab) => key(tab) === key(id)),
				getTabListLength: () => tabs.length,
				notifyTabActivated: (index) => dispatch(getElement(), 'SMUITabBarActivated', { index })
			});

			instance.init();

			return () => {
				instance?.destroy();
				instance = undefined;
			};
		});

		function getAccessor(tabId) {
			return tabId instanceof Object ? tabAccessorWeakMap.get(tabId) : tabAccessorMap[tabId];
		}

		function addAccessor(tabId, accessor) {
			if (tabId instanceof Object) {
				tabAccessorWeakMap.set(tabId, accessor);
				tabAccessorWeakMap = tabAccessorWeakMap;
			} else {
				tabAccessorMap[tabId] = accessor;
			}
		}

		function removeAccessor(tabId) {
			if (tabId instanceof Object) {
				tabAccessorWeakMap.delete(tabId);
				tabAccessorWeakMap = tabAccessorWeakMap;
			} else {
				delete tabAccessorMap[tabId];
			}
		}

		function scrollIntoView(index) {
			instance?.scrollIntoView(index);
		}

		function getElement() {
			return element;
		}

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(classMap({ 'mdc-tab-bar': true, [className]: true })),
			role: 'tablist',
			tabindex,
			...exclude(restProps, ['tabScroller$'])
		})}>`);

		TabScroller($$renderer, $.spread_props([
			prefixFilter(restProps, 'tabScroller$'),
			{
				children: ($$renderer) => {
					$$renderer.push(`<!--[-->`);

					const each_array = $.ensure_array_like(tabs);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let tabKey = each_array[$$index];

						tab($$renderer, tabKey);
						$$renderer.push(`<!---->`);
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			}
		]));

		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { active, scrollIntoView, getElement });
	});
}