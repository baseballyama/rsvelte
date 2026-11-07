import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, setContext, getContext } from 'svelte';
import { classMap, exclude, prefixFilter, useActions, dispatch } from '@smui/common/internal';
import Ripple from '@smui/ripple';
import { SmuiElement } from '@smui/common';
import TabIndicator from '@smui/tab-indicator';
import { MDCTabFoundation } from './mdc';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'style',
	'tab',
	'ripple',
	'stacked',
	'minWidth',
	'indicatorSpanOnlyContent',
	'href',
	'content$use',
	'content$class',
	'component',
	'tag',
	'children',
	'tabIndicator'
]);

var root = $.from_html(`<span><!> <!></span> <!> <span class="mdc-tab__ripple"></span>`, 1);

export default function Tab($$anchor, $$props) {
	$.push($$props, true);

	const tabIndicatorSnippet = ($$anchor) => {
		{
			let $0 = $.derived(() => prefixFilter(restProps, 'tabIndicator$'));

			$.bind_this(
				TabIndicator($$anchor, $.spread_props(() => $.get($0), {
					get active() {
						return $.get(active);
					},

					set active($$value) {
						$.set(active, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_1 = $.comment();
						var node = $.first_child(fragment_1);

						$.snippet(node, () => $$props.tabIndicator ?? $.noop);
						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				})),
				($$value) => tabIndicatorInstance = $$value,
				() => tabIndicatorInstance
			);
		}
	};

	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		style = $.prop($$props, 'style', 3, ''),
		ripple = $.prop($$props, 'ripple', 3, true),
		stacked = $.prop($$props, 'stacked', 3, false),
		minWidth = $.prop($$props, 'minWidth', 3, false),
		indicatorSpanOnlyContent = $.prop($$props, 'indicatorSpanOnlyContent', 3, false),
		href = $.prop($$props, 'href', 3, undefined),
		content$use = $.prop($$props, 'content$use', 19, () => []),
		content$class = $.prop($$props, 'content$class', 3, ''),
		MyComponent = $.prop($$props, 'component', 3, SmuiElement),
		tag = $.prop($$props, 'tag', 19, () => href() == null ? 'button' : 'a'),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	let instance = $.state(void 0);
	let content;
	let tabIndicatorInstance;
	let internalClasses = $.proxy({});
	let internalStyles = $.proxy({});
	let internalAttrs = $.proxy({});
	let focusOnActivate = getContext('SMUI:tab:focusOnActivate');
	const initialActive = getContext('SMUI:tab:initialActive');
	let active = $.state($.proxy(initialActive.active != null && initialActive.key($$props.tab) === initialActive.active));
	let forceAccessible = $.state(false);

	setContext('SMUI:label:context', 'tab');
	setContext('SMUI:icon:context', 'tab');

	if (!$$props.tab) {
		throw new Error('The tab property is required! It should be passed down from the TabBar to the Tab.');
	}

	let setFocusOnActivate = false;

	$.user_effect(() => {
		if (!$.get(instance)) {
			setFocusOnActivate = false;

			return;
		}

		if (!setFocusOnActivate) {
			setFocusOnActivate = true;
			$.get(instance).setFocusOnActivate(focusOnActivate);
		}
	});

	const SMUITabMount = getContext('SMUI:tab:mount');
	const SMUITabUnmount = getContext('SMUI:tab:unmount');

	onMount(() => {
		$.set(
			instance,
			new MDCTabFoundation({
				setAttr: addAttr,
				addClass,
				removeClass,
				hasClass,
				activateIndicator: (previousIndicatorClientRect) => tabIndicatorInstance.activate(previousIndicatorClientRect),
				deactivateIndicator: () => tabIndicatorInstance.deactivate(),
				notifyInteracted: () => dispatch(getElement(), 'SMUITabInteracted', { tabId: $$props.tab }),
				getOffsetLeft: () => getElement().offsetLeft,
				getOffsetWidth: () => getElement().offsetWidth,
				getContentOffsetLeft: () => content.offsetLeft,
				getContentOffsetWidth: () => content.offsetWidth,
				focus,
				isFocused: () => getElement() === document.activeElement
			}),
			true
		);

		const accessor = {
			tabId: $$props.tab,
			get element() {
				return getElement();
			},

			get active() {
				return $.get(active);
			},

			forceAccessible(accessible) {
				$.set(forceAccessible, accessible, true);
			},
			computeIndicatorClientRect: () => tabIndicatorInstance.computeContentClientRect(),
			computeDimensions: () => {
				if ($.get(instance) == null) {
					throw new Error('Instance is undefined.');
				}

				return $.get(instance).computeDimensions();
			},
			focus,
			activate,
			deactivate
		};

		SMUITabMount && SMUITabMount(accessor);
		$.get(instance).init();

		return () => {
			SMUITabUnmount && SMUITabUnmount(accessor);
			$.get(instance)?.destroy();
			$.set(instance, undefined);
		};
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

	function addStyle(name, value) {
		if (internalStyles[name] != value) {
			if (value === '' || value == null) {
				delete internalStyles[name];
			} else {
				internalStyles[name] = value;
			}
		}
	}

	function addAttr(name, value) {
		if (internalAttrs[name] !== value) {
			internalAttrs[name] = value;
		}
	}

	function activate(previousIndicatorClientRect, skipFocus) {
		$.set(active, true);

		if (skipFocus) {
			$.get(instance)?.setFocusOnActivate(false);
		}

		$.get(instance)?.activate(previousIndicatorClientRect);

		if (skipFocus) {
			$.get(instance)?.setFocusOnActivate(focusOnActivate);
		}
	}

	function deactivate() {
		$.set(active, false);
		$.get(instance)?.deactivate();
	}

	function focus() {
		getElement().focus();
	}

	function getElement() {
		return element.getElement();
	}

	var $$exports = { activate, deactivate, focus, getElement };
	var fragment_2 = $.comment();
	var node_1 = $.first_child(fragment_2);

	{
		let $0 = $.derived(() => [
			[
				Ripple,
				{
					ripple: ripple(),
					unbounded: false,
					addClass,
					removeClass,
					addStyle
				}
			],
			...use()
		]);

		let $1 = $.derived(() => classMap({
			'mdc-tab': true,
			'mdc-tab--active': $.get(active),
			'mdc-tab--stacked': stacked(),
			'mdc-tab--min-width': minWidth(),
			...internalClasses,
			[className()]: true
		}));

		let $2 = $.derived(() => Object.entries(internalStyles).map(([name, value]) => `${name}: ${value};`).concat([style()]).join(' '));
		let $3 = $.derived(() => $.get(active) ? 'true' : 'false');
		let $4 = $.derived(() => $.get(active) || $.get(forceAccessible) ? '0' : '-1');
		let $5 = $.derived(() => exclude(restProps, ['content$', 'tabIndicator$']));

		$.component(node_1, MyComponent, ($$anchor, MyComponent_1) => {
			$.bind_this(
				MyComponent_1($$anchor, $.spread_props(
					{
						get tag() {
							return tag();
						},

						get use() {
							return $.get($0);
						},

						get class() {
							return $.get($1);
						},

						get style() {
							return $.get($2);
						},
						role: 'tab',
						get 'aria-selected'() {
							return $.get($3);
						},

						get tabindex() {
							return $.get($4);
						},

						get href() {
							return href();
						}
					},
					() => internalAttrs,
					() => $.get($5),
					{
						onclick: (e) => {
							$$props.onclick?.(e);

							if (!e.defaultPrevented && $.get(instance)) {
								$.get(instance).handleClick();
							}
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var span = $.first_child(fragment_3);

							$.attribute_effect(span, ($0, $1) => ({ class: $0, ...$1 }), [
								() => classMap({ 'mdc-tab__content': true, [content$class()]: true }),
								() => prefixFilter(restProps, 'content$')
							]);

							var node_2 = $.child(span);

							$.snippet(node_2, () => $$props.children ?? $.noop);

							var node_3 = $.sibling(node_2, 2);

							{
								var consequent = ($$anchor) => {
									tabIndicatorSnippet($$anchor);
								};

								$.if(node_3, ($$render) => {
									if (indicatorSpanOnlyContent()) $$render(consequent);
								});
							}

							$.reset(span);
							$.bind_this(span, ($$value) => content = $$value, () => content);
							$.action(span, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), content$use);

							var node_4 = $.sibling(span, 2);

							{
								var consequent_1 = ($$anchor) => {
									tabIndicatorSnippet($$anchor);
								};

								$.if(node_4, ($$render) => {
									if (!indicatorSpanOnlyContent()) $$render(consequent_1);
								});
							}

							$.next(2);
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					}
				)),
				($$value) => element = $$value,
				() => element
			);
		});
	}

	$.append($$anchor, fragment_2);

	return $.pop($$exports);
}