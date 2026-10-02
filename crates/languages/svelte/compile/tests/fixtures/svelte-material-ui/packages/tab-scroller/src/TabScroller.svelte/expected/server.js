import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { ponyfill } from '@smui/common/dom';
import { classMap, exclude, prefixFilter, useActions } from '@smui/common/internal';
import { MDCTabScrollerFoundation, util } from './mdc';

export default function TabScroller($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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
		let {
			use = [],
			class: className = '',
			align = undefined,
			scrollArea$use = [],
			scrollArea$class = '',
			scrollContent$use = [],
			scrollContent$class = '',
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;
		let instance = void 0;
		let scrollArea;
		let scrollContent;
		let internalClasses = {};
		let scrollAreaClasses = {};
		let scrollAreaStyles = {};
		let scrollContentStyles = {};

		onMount(() => {
			instance = new MDCTabScrollerFoundation({
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
			});

			instance.init();

			return () => {
				instance?.destroy();
				instance = undefined;
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
			if (instance == null) {
				throw new Error('Instance is undefined.');
			}

			return instance.getScrollPosition();
		}

		function getScrollContentWidth() {
			return scrollContent.offsetWidth;
		}

		function incrementScroll(scrollXIncrement) {
			instance?.incrementScroll(scrollXIncrement);
		}

		function scrollTo(scrollX) {
			instance?.scrollTo(scrollX);
		}

		function getElement() {
			return element;
		}

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(classMap({
				'mdc-tab-scroller': true,
				'mdc-tab-scroller--align-start': align === 'start',
				'mdc-tab-scroller--align-end': align === 'end',
				'mdc-tab-scroller--align-center': align === 'center',
				...internalClasses,
				[className]: true
			})),
			...exclude(restProps, ['scrollArea$', 'scrollContent$'])
		})}><div${$.attributes({
			class: $.clsx(classMap({
				'mdc-tab-scroller__scroll-area': true,
				...scrollAreaClasses,
				[scrollArea$class]: true
			})),
			style: Object.entries(scrollAreaStyles).map(([name, value]) => `${name}: ${value};`).join(' '),
			...prefixFilter(restProps, 'scrollArea$')
		})}><div${$.attributes({
			class: $.clsx(classMap({
				'mdc-tab-scroller__scroll-content': true,
				[scrollContent$class]: true
			})),
			style: Object.entries(scrollContentStyles).map(([name, value]) => `${name}: ${value};`).join(' '),
			...prefixFilter(restProps, 'scrollContent$')
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div></div></div>`);

		$.bind_props($$props, {
			getScrollPosition,
			getScrollContentWidth,
			incrementScroll,
			scrollTo,
			getElement
		});
	});
}