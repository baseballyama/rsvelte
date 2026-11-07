import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { ponyfill } from '@smui/common/dom';
import { classMap, exclude, prefixFilter, useActions } from '@smui/common/internal';
import { MDCTabScrollerFoundation, util } from './mdc';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'align',
	'scrollArea$use',
	'scrollArea$class',
	'scrollContent$use',
	'scrollContent$class',
	'children'
]);

var root = $.from_html(`<div><div><div><!></div></div></div>`);

export default function TabScroller($$anchor, $$props) {
	$.push($$props, true);

	const { matches } = ponyfill;

	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * Where to align the tabs.
	 */
	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		align = $.prop($$props, 'align', 3, undefined),
		scrollArea$use = $.prop($$props, 'scrollArea$use', 19, () => []),
		scrollArea$class = $.prop($$props, 'scrollArea$class', 3, ''),
		scrollContent$use = $.prop($$props, 'scrollContent$use', 19, () => []),
		scrollContent$class = $.prop($$props, 'scrollContent$class', 3, ''),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	let instance = $.state(void 0);
	let scrollArea;
	let scrollContent;
	let internalClasses = $.proxy({});
	let scrollAreaClasses = $.proxy({});
	let scrollAreaStyles = $.proxy({});
	let scrollContentStyles = $.proxy({});

	onMount(() => {
		$.set(
			instance,
			new MDCTabScrollerFoundation({
				eventTargetMatchesSelector: (evtTarget, selector) => matches(evtTarget, selector),
				addClass,
				removeClass,
				addScrollAreaClass,
				setScrollAreaStyleProperty: addScrollAreaStyle,
				setScrollContentStyleProperty: addScrollContentStyle,
				getScrollContentStyleValue: getScrollContentStyle,
				setScrollAreaScrollLeft: (scrollX) => scrollArea.scrollLeft = scrollX,
				getScrollAreaScrollLeft: () => scrollArea.scrollLeft,
				getScrollContentOffsetWidth: () => scrollContent.offsetWidth,
				getScrollAreaOffsetWidth: () => scrollArea.offsetWidth,
				computeScrollAreaClientRect: () => scrollArea.getBoundingClientRect(),
				computeScrollContentClientRect: () => scrollContent.getBoundingClientRect(),
				computeHorizontalScrollbarHeight: () => util.computeHorizontalScrollbarHeight(document)
			}),
			true
		);

		$.get(instance).init();

		return () => {
			$.get(instance)?.destroy();
			$.set(instance, undefined);
		};
	});

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

	function addScrollAreaClass(className) {
		if (!scrollAreaClasses[className]) {
			scrollAreaClasses[className] = true;
		}
	}

	function addScrollAreaStyle(name, value) {
		if (scrollAreaStyles[name] != value) {
			if (value === '' || value == null) {
				delete scrollAreaStyles[name];
			} else {
				scrollAreaStyles[name] = value;
			}
		}
	}

	function addScrollContentStyle(name, value) {
		if (scrollContentStyles[name] != value) {
			if (value === '' || value == null) {
				delete scrollContentStyles[name];
			} else {
				scrollContentStyles[name] = value;
			}
		}
	}

	function getScrollContentStyle(name) {
		return name in scrollContentStyles
			? scrollContentStyles[name]
			: getComputedStyle(scrollContent).getPropertyValue(name);
	}

	function getScrollPosition() {
		if ($.get(instance) == null) {
			throw new Error('Instance is undefined.');
		}

		return $.get(instance).getScrollPosition();
	}

	function getScrollContentWidth() {
		return scrollContent.offsetWidth;
	}

	function incrementScroll(scrollXIncrement) {
		$.get(instance)?.incrementScroll(scrollXIncrement);
	}

	function scrollTo(scrollX) {
		$.get(instance)?.scrollTo(scrollX);
	}

	function getElement() {
		return element;
	}

	var $$exports = {
		getScrollPosition,
		getScrollContentWidth,
		incrementScroll,
		scrollTo,
		getElement
	};

	var div = root();

	$.attribute_effect(div, ($0, $1) => ({ class: $0, ...$1 }), [
		() => classMap({
			'mdc-tab-scroller': true,
			'mdc-tab-scroller--align-start': align() === 'start',
			'mdc-tab-scroller--align-end': align() === 'end',
			'mdc-tab-scroller--align-center': align() === 'center',
			...internalClasses,
			[className()]: true
		}),
		() => exclude(restProps, ['scrollArea$', 'scrollContent$'])
	]);

	var div_1 = $.child(div);

	var event_handler = (e) => {
		if ($.get(instance)) {
			$.get(instance).handleInteraction();
		}

		$$props.scrollArea$onwheel?.(e);
	};

	var event_handler_1 = (e) => {
		if ($.get(instance)) {
			$.get(instance).handleInteraction();
		}

		$$props.scrollArea$ontouchstart?.(e);
	};

	var event_handler_2 = (e) => {
		if ($.get(instance)) {
			$.get(instance).handleInteraction();
		}

		$$props.scrollArea$onpointerdown?.(e);
	};

	var event_handler_3 = (e) => {
		if ($.get(instance)) {
			$.get(instance).handleInteraction();
		}

		$$props.scrollArea$onmousedown?.(e);
	};

	var event_handler_4 = (e) => {
		if ($.get(instance)) {
			$.get(instance).handleInteraction();
		}

		$$props.scrollArea$onkeydown?.(e);
	};

	$.attribute_effect(
		div_1,
		($0, $1, $2) => ({
			class: $0,
			style: $1,
			...$2,
			onwheel: event_handler,
			ontouchstart: event_handler_1,
			onpointerdown: event_handler_2,
			onmousedown: event_handler_3,
			onkeydown: event_handler_4
		}),
		[
			() => classMap({
				'mdc-tab-scroller__scroll-area': true,
				...scrollAreaClasses,
				[scrollArea$class()]: true
			}),
			() => Object.entries(scrollAreaStyles).map(([name, value]) => `${name}: ${value};`).join(' '),
			() => prefixFilter(restProps, 'scrollArea$')
		]
	);

	var div_2 = $.child(div_1);

	var event_handler_5 = (e) => {
		if ($.get(instance)) {
			$.get(instance).handleTransitionEnd(e);
		}

		$$props.scrollContent$ontransitionend?.(e);
	};

	$.attribute_effect(
		div_2,
		($0, $1, $2) => ({
			class: $0,
			style: $1,
			...$2,
			ontransitionend: event_handler_5
		}),
		[
			() => classMap({
				'mdc-tab-scroller__scroll-content': true,
				[scrollContent$class()]: true
			}),
			() => Object.entries(scrollContentStyles).map(([name, value]) => `${name}: ${value};`).join(' '),
			() => prefixFilter(restProps, 'scrollContent$')
		]
	);

	var node = $.child(div_2);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div_2);
	$.bind_this(div_2, ($$value) => scrollContent = $$value, () => scrollContent);
	$.action(div_2, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), scrollContent$use);
	$.reset(div_1);
	$.bind_this(div_1, ($$value) => scrollArea = $$value, () => scrollArea);
	$.action(div_1, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), scrollArea$use);
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
	 * Where to align the tabs.
	 */
	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
}