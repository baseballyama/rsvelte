import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, setContext } from 'svelte';
import { classMap, exclude, prefixFilter, useActions, dispatch } from '@smui/common/internal';
import TabScroller from '@smui/tab-scroller';
import { MDCTabBarFoundation } from './mdc';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'tabs',
	'key',
	'focusOnActivate',
	'focusOnProgrammatic',
	'useAutomaticActivation',
	'active',
	'tabindex',
	'tab'
]);

var root = $.from_html(`<div><!></div>`);

export default function TabBar($$anchor, $$props) {
	$.push($$props, true);

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
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		tabs = $.prop($$props, 'tabs', 19, () => []),
		key = $.prop($$props, 'key', 3, (tab) => tab),
		focusOnActivate = $.prop($$props, 'focusOnActivate', 3, true),
		focusOnProgrammatic = $.prop($$props, 'focusOnProgrammatic', 3, false),
		useAutomaticActivation = $.prop($$props, 'useAutomaticActivation', 3, true),
		active = $.prop($$props, 'active', 15),
		tabindex = $.prop($$props, 'tabindex', 3, 0),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	let instance = $.state(void 0);
	let tabScroller;

	let activeIndex = $.state($.proxy(active() == null
		? -1
		: tabs().findIndex((tab) => active() && key()(tab) === key()(active()))));

	let tabAccessorMap = $.proxy({});
	let tabAccessorWeakMap = $.state(new WeakMap());
	let skipFocus = false;

	setContext('SMUI:tab:focusOnActivate', focusOnActivate());

	setContext('SMUI:tab:initialActive', {
		active: active() == null ? null : key()(active()),
		key: key()
	});

	$.user_effect(() => {
		if (active() == null && $.get(activeIndex) !== -1 || active() != null && $.get(activeIndex) === -1 || active() != null && key()(active()) !== key()(tabs()[$.get(activeIndex)])) {
			$.set(activeIndex, tabs().findIndex((tab) => active() && key()(tab) === key()(active())), true);

			if ($.get(instance)) {
				skipFocus = !focusOnProgrammatic();
				$.get(instance).activateTab($.get(activeIndex));
				skipFocus = false;
			}
		}
	});

	$.user_effect(() => {
		if (tabs().length) {
			// Manually get the accessor so it is reactive.
			const accessor = tabs()[0] instanceof Object
				? $.get(tabAccessorWeakMap).get(tabs()[0])
				: tabAccessorMap[tabs()[0]];

			if (accessor) {
				accessor.forceAccessible($.get(activeIndex) === -1);
			}
		}
	});

	let setUseAutomaticActivation = false;

	$.user_effect(() => {
		if (!$.get(instance)) {
			setUseAutomaticActivation = false;

			return;
		}

		if (!setUseAutomaticActivation) {
			setUseAutomaticActivation = true;
			$.get(instance).setUseAutomaticActivation(useAutomaticActivation());
		}
	});

	setContext('SMUI:tab:mount', (accessor) => {
		addAccessor(accessor.tabId, accessor);
	});

	setContext('SMUI:tab:unmount', (accessor) => {
		removeAccessor(accessor.tabId);
	});

	onMount(() => {
		$.set(
			instance,
			new MDCTabBarFoundation({
				scrollTo: (scrollX) => tabScroller.scrollTo(scrollX),
				incrementScroll: (scrollXIncrement) => tabScroller.incrementScroll(scrollXIncrement),
				getScrollPosition: () => tabScroller.getScrollPosition(),
				getScrollContentWidth: () => tabScroller.getScrollContentWidth(),
				getOffsetWidth: () => getElement().offsetWidth,
				isRTL: () => getComputedStyle(getElement()).getPropertyValue('direction') === 'rtl',
				setActiveTab: (index) => {
					active(tabs()[index]);
					$.set(activeIndex, index, true);
					$.get(instance)?.activateTab(index);
				},
				activateTabAtIndex: (index, clientRect) => getAccessor(tabs()[index])?.activate(clientRect, skipFocus),
				deactivateTabAtIndex: (index) => getAccessor(tabs()[index])?.deactivate(),
				focusTabAtIndex: (index) => getAccessor(tabs()[index])?.focus(),
				getTabIndicatorClientRectAtIndex: (index) => getAccessor(tabs()[index])?.computeIndicatorClientRect() ?? new DOMRect(),
				getTabDimensionsAtIndex: (index) => getAccessor(tabs()[index])?.computeDimensions() ?? { rootLeft: 0, rootRight: 0, contentLeft: 0, contentRight: 0 },
				getPreviousActiveTabIndex: () => {
					for (let i = 0; i < tabs().length; i++) {
						if (getAccessor(tabs()[i])?.active) {
							return i;
						}
					}

					return -1;
				},

				getFocusedTabIndex: () => {
					const tabElements = tabs().map((tab) => getAccessor(tab)?.element);
					const activeElement = document.activeElement;

					return tabElements.indexOf(activeElement);
				},
				getIndexOfTabById: (id) => tabs().findIndex((tab) => key()(tab) === key()(id)),
				getTabListLength: () => tabs().length,
				notifyTabActivated: (index) => dispatch(getElement(), 'SMUITabBarActivated', { index })
			}),
			true
		);

		$.get(instance).init();

		return () => {
			$.get(instance)?.destroy();
			$.set(instance, undefined);
		};
	});

	function getAccessor(tabId) {
		return tabId instanceof Object
			? $.get(tabAccessorWeakMap).get(tabId)
			: tabAccessorMap[tabId];
	}

	function addAccessor(tabId, accessor) {
		if (tabId instanceof Object) {
			$.get(tabAccessorWeakMap).set(tabId, accessor);
			$.set(tabAccessorWeakMap, $.get(tabAccessorWeakMap));
		} else {
			tabAccessorMap[tabId] = accessor;
		}
	}

	function removeAccessor(tabId) {
		if (tabId instanceof Object) {
			$.get(tabAccessorWeakMap).delete(tabId);
			$.set(tabAccessorWeakMap, $.get(tabAccessorWeakMap));
		} else {
			delete tabAccessorMap[tabId];
		}
	}

	function scrollIntoView(index) {
		$.get(instance)?.scrollIntoView(index);
	}

	function getElement() {
		return element;
	}

	var $$exports = { scrollIntoView, getElement };
	var div = root();

	var event_handler = (e) => {
		if ($.get(instance)) {
			$.get(instance).handleKeyDown(e);
		}

		$$props.onkeydown?.(e);
	};

	var event_handler_1 = (e) => {
		if ($.get(instance)) {
			$.get(instance).handleTabInteraction(e);
		}

		$$props.onSMUITabInteracted?.(e);
	};

	$.attribute_effect(
		div,
		($0, $1) => ({
			class: $0,
			role: 'tablist',
			tabindex: tabindex(),
			...$1,
			onkeydown: event_handler,
			onSMUITabInteracted: event_handler_1
		}),
		[
			() => classMap({ 'mdc-tab-bar': true, [className()]: true }),
			() => exclude(restProps, ['tabScroller$'])
		]
	);

	var node = $.child(div);

	{
		let $0 = $.derived(() => prefixFilter(restProps, 'tabScroller$'));

		$.bind_this(
			TabScroller(node, $.spread_props(() => $.get($0), {
				children: ($$anchor, $$slotProps) => {
					var fragment = $.comment();
					var node_1 = $.first_child(fragment);

					$.each(node_1, 17, tabs, (tabKey) => key()(tabKey), ($$anchor, tabKey) => {
						var fragment_1 = $.comment();
						var node_2 = $.first_child(fragment_1);

						$.snippet(node_2, () => $$props.tab, () => $.get(tabKey));
						$.append($$anchor, fragment_1);
					});

					$.append($$anchor, fragment);
				},
				$$slots: { default: true }
			})),
			($$value) => tabScroller = $$value,
			() => tabScroller
		);
	}

	$.reset(div);
	$.bind_this(div, ($$value) => element = $$value, () => element);
	$.action(div, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
	$.append($$anchor, div);

	return $.pop($$exports);
}