import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { readable } from 'svelte/store';
import { classMap, useActions, dispatch, SvelteEventManager } from '@smui/common/internal';

import {
	MDCTopAppBarBaseFoundation,
	MDCTopAppBarFoundation,
	MDCFixedTopAppBarFoundation,
	MDCShortTopAppBarFoundation
} from './mdc';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'style',
	'variant',
	'color',
	'collapsed',
	'prominent',
	'dense',
	'scrollTarget',
	'children'
]);

var root = $.from_html(`<header><!></header>`);

export default function TopAppBar($$anchor, $$props) {
	$.push($$props, true);

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
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		style = $.prop($$props, 'style', 3, ''),
		variant = $.prop($$props, 'variant', 3, 'standard'),
		color = $.prop($$props, 'color', 3, 'primary'),
		collapsed = $.prop($$props, 'collapsed', 15, uninitializedValue),
		prominent = $.prop($$props, 'prominent', 3, false),
		dense = $.prop($$props, 'dense', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	// Some trickery to detect uninitialized values but also have the right types.
	const alwaysCollapsed = !isUninitializedValue(collapsed()) && !!collapsed();

	if (isUninitializedValue(collapsed())) {
		collapsed(false);
	}

	// Done with the trickery.
	let element;

	let instance = $.state(void 0);
	let eventManager = new SvelteEventManager();
	let internalClasses = $.state($.proxy({}));
	let internalStyles = $.state($.proxy({}));
	let propStoreSet = $.state(void 0);

	let propStore = readable({ variant: variant(), prominent: prominent(), dense: dense() }, (set) => {
		$.set(propStoreSet, set, true);
	});

	$.user_effect(() => {
		if ($.get(propStoreSet)) {
			$.get(propStoreSet)({ variant: variant(), prominent: prominent(), dense: dense() });
		}
	});

	$.user_effect(() => {
		if ($.get(instance) && variant() === 'short' && 'setAlwaysCollapsed' in $.get(instance)) {
			$.get(instance).setAlwaysCollapsed(alwaysCollapsed);
		}
	});

	let oldScrollTarget = undefined;

	$.user_effect(() => {
		if (oldScrollTarget !== $$props.scrollTarget) {
			if (oldScrollTarget) {
				eventManager.off(oldScrollTarget, 'scroll', handleTargetScroll);
			}

			if ($$props.scrollTarget) {
				eventManager.on($$props.scrollTarget, 'scroll', handleTargetScroll);
			}

			oldScrollTarget = $$props.scrollTarget;
		}
	});

	let oldVariant = variant();

	$.user_effect(() => {
		if (oldVariant !== variant() && $.get(instance)) {
			oldVariant = variant();
			$.get(instance).destroy();
			$.set(instance, undefined);
			$.set(internalClasses, {}, true);
			$.set(internalStyles, {}, true);
			$.set(instance, getInstance(), true);
			$.get(instance).init();
		}
	});

	onMount(() => {
		$.set(instance, getInstance(), true);
		$.get(instance).init();

		return () => {
			$.get(instance)?.destroy();
			$.set(instance, undefined);
			eventManager.clear();
		};
	});

	function getInstance() {
		const Foundation = ({
			static: MDCTopAppBarBaseFoundation,
			short: MDCShortTopAppBarFoundation,
			fixed: MDCFixedTopAppBarFoundation,
			standard: MDCTopAppBarFoundation
		})[variant()] || MDCTopAppBarFoundation;

		return new Foundation({
			hasClass,
			addClass,
			removeClass,
			setStyle: addStyle,
			getTopAppBarHeight: () => getElement().clientHeight,
			notifyNavigationIconClicked: () => dispatch(getElement(), 'SMUITopAppBarNav'),
			getViewportScrollY: () => $$props.scrollTarget == null ? window.pageYOffset : $$props.scrollTarget.scrollTop,
			getTotalActionItems: () => getElement().querySelectorAll('.mdc-top-app-bar__action-item').length
		});
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

	function addStyle(name, value) {
		if ($.get(internalStyles)[name] != value) {
			if (value === '' || value == null) {
				delete $.get(internalStyles)[name];
			} else {
				$.get(internalStyles)[name] = value;
			}
		}
	}

	function handleTargetScroll() {
		if ($.get(instance)) {
			$.get(instance).handleTargetScroll();

			if (variant() === 'short') {
				collapsed('isCollapsed' in $.get(instance) && $.get(instance).isCollapsed);
			}
		}
	}

	function getPropStore() {
		return propStore;
	}

	function getElement() {
		return element;
	}

	var $$exports = { getPropStore, getElement };
	var header = root();

	$.event('resize', $.window, () => variant() !== 'short' && variant() !== 'fixed' && $.get(instance) && $.get(instance).handleWindowResize());
	$.event('scroll', $.window, () => $$props.scrollTarget == null && handleTargetScroll());

	var event_handler = (e) => {
		if ($.get(instance)) {
			$.get(instance).handleNavigationClick();
		}

		$$props.onSMUITopAppBarIconButtonNav?.(e);
	};

	$.attribute_effect(
		header,
		($0, $1) => ({
			class: $0,
			style: $1,
			...restProps,
			onSMUITopAppBarIconButtonNav: event_handler
		}),
		[
			() => classMap({
				'mdc-top-app-bar': true,
				'mdc-top-app-bar--short': variant() === 'short',
				'mdc-top-app-bar--short-collapsed': collapsed(),
				'mdc-top-app-bar--fixed': variant() === 'fixed',
				'smui-top-app-bar--static': variant() === 'static',
				'smui-top-app-bar--color-secondary': color() === 'secondary',
				'mdc-top-app-bar--prominent': prominent(),
				'mdc-top-app-bar--dense': dense(),
				...$.get(internalClasses),
				[className()]: true
			}),
			() => Object.entries($.get(internalStyles)).map(([name, value]) => `${name}: ${value};`).concat([style()]).join(' ')
		]
	);

	var node = $.child(header);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(header);
	$.bind_this(header, ($$value) => element = $$value, () => element);
	$.action(header, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
	$.append($$anchor, header);

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
	// Some trickery to detect uninitialized values but also have the right types.
	// Done with the trickery.
}