import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, getContext, tick } from 'svelte';
import { classMap, exclude, prefixFilter, useActions, dispatch } from '@smui/common/internal';
import Ripple from '@smui/ripple';
import { deprecated } from './mdc';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'style',
	'ripple',
	'touch',
	'nonNavigable',
	'icon$use',
	'icon$class',
	'children'
]);

var root = $.from_html(`<span class="mdc-deprecated-chip-trailing-action__touch"></span>`);
var root_1 = $.from_html(`<button><span class="mdc-deprecated-chip-trailing-action__ripple"></span> <!> <span><!></span></button>`);

export default function TrailingAction($$anchor, $$props) {
	$.push($$props, true);

	const { MDCChipTrailingActionFoundation } = deprecated;

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
	 * Whether to show a ripple animation.
	 */
	/**
	 * Whether to use touch styling
	 */
	/**
	 * Whether to hide this element from the accessibility tree.
	 */
	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		style = $.prop($$props, 'style', 3, ''),
		ripple = $.prop($$props, 'ripple', 3, true),
		touch = $.prop($$props, 'touch', 3, false),
		nonNavigable = $.prop($$props, 'nonNavigable', 3, false),
		icon$use = $.prop($$props, 'icon$use', 19, () => []),
		icon$class = $.prop($$props, 'icon$class', 3, ''),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	let instance = $.state(void 0);
	let internalClasses = $.proxy({});
	let internalStyles = $.proxy({});
	let internalAttrs = $.proxy({});
	const SMUIChipsTrailingActionMount = getContext('SMUI:chips:trailing-action:mount');
	const SMUIChipsTrailingActionUnmount = getContext('SMUI:chips:trailing-action:unmount');

	onMount(() => {
		$.set(
			instance,
			new MDCChipTrailingActionFoundation({
				focus: () => {
					const element = getElement();

					// Let the tabindex change propagate.
					waitForTabindex(() => {
						element.focus();
					});
				},
				getAttribute: getAttr,
				notifyInteraction: (trigger) => dispatch(getElement(), 'SMUIChipTrailingActionInteraction', { trigger }),
				notifyNavigation: (key) => dispatch(getElement(), 'SMUIChipTrailingActionNavigation', { key }),
				setAttribute: addAttr
			}),
			true
		);

		const accessor = { isNavigable, focus, removeFocus };

		SMUIChipsTrailingActionMount && SMUIChipsTrailingActionMount(accessor);
		$.get(instance).init();

		return () => {
			SMUIChipsTrailingActionUnmount && SMUIChipsTrailingActionUnmount(accessor);
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

	function addStyle(name, value) {
		if (internalStyles[name] != value) {
			if (value === '' || value == null) {
				delete internalStyles[name];
			} else {
				internalStyles[name] = value;
			}
		}
	}

	function getAttr(name) {
		return name in internalAttrs
			? internalAttrs[name] ?? null
			: getElement().getAttribute(name);
	}

	function addAttr(name, value) {
		if (internalAttrs[name] !== value) {
			internalAttrs[name] = value;
		}
	}

	function waitForTabindex(fn) {
		if (internalAttrs['tabindex'] !== getElement().getAttribute('tabindex')) {
			tick().then(fn);
		} else {
			fn();
		}
	}

	function isNavigable() {
		if ($.get(instance) == null) {
			throw new Error('Instance is undefined.');
		}

		return $.get(instance).isNavigable();
	}

	function focus() {
		$.get(instance)?.focus();
	}

	function removeFocus() {
		$.get(instance)?.removeFocus();
	}

	function getElement() {
		return element;
	}

	var $$exports = { isNavigable, focus, removeFocus, getElement };
	var button = root_1();

	var event_handler = (e) => {
		if ($.get(instance)) {
			$.get(instance).handleClick(e);
		}

		$$props.onclick?.(e);
	};

	var event_handler_1 = (e) => {
		if ($.get(instance)) {
			$.get(instance).handleKeydown(e);
		}

		$$props.onkeydown?.(e);
	};

	$.attribute_effect(
		button,
		($0, $1, $2) => ({
			type: 'button',
			class: $0,
			style: $1,
			'aria-hidden': nonNavigable() ? 'true' : undefined,
			tabindex: '-1',
			...internalAttrs,
			...$2,
			onclick: event_handler,
			onkeydown: event_handler_1
		}),
		[
			() => classMap({
				'mdc-deprecated-chip-trailing-action': true,
				...internalClasses,
				[className()]: true
			}),
			() => Object.entries(internalStyles).map(([name, value]) => `${name}: ${value};`).concat([style()]).join(' '),
			() => exclude(restProps, ['icon$'])
		]
	);

	var node = $.sibling($.child(button), 2);

	{
		var consequent = ($$anchor) => {
			var span = root();

			$.append($$anchor, span);
		};

		$.if(node, ($$render) => {
			if (touch()) $$render(consequent);
		});
	}

	var span_1 = $.sibling(node, 2);

	$.attribute_effect(span_1, ($0, $1) => ({ class: $0, ...$1 }), [
		() => classMap({
			'mdc-deprecated-chip-trailing-action__icon': true,
			[icon$class()]: true
		}),
		() => prefixFilter(restProps, 'icon$')
	]);

	var node_1 = $.child(span_1);

	$.snippet(node_1, () => $$props.children ?? $.noop);
	$.reset(span_1);
	$.action(span_1, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), icon$use);
	$.reset(button);
	$.bind_this(button, ($$value) => element = $$value, () => element);

	$.action(button, ($$node, $$action_arg) => Ripple?.($$node, $$action_arg), () => ({
		ripple: ripple(),
		unbounded: false,
		addClass,
		removeClass,
		addStyle
	}));

	$.action(button, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
	$.append($$anchor, button);

	return $.pop($$exports);
}