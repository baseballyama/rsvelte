import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { classMap, useActions, SvelteEventManager } from '@smui/common/internal';
import { MDCLineRippleFoundation } from './mdc';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'style',
	'active'
]);

var root = $.from_html(`<div></div>`);

export default function LineRipple($$anchor, $$props) {
	$.push($$props, true);

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
	 * Whether the line is active.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		style = $.prop($$props, 'style', 3, ''),
		active = $.prop($$props, 'active', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	let instance = $.state(void 0);
	let eventManager = new SvelteEventManager();
	let internalClasses = $.proxy({});
	let internalStyles = $.proxy({});

	onMount(() => {
		$.set(
			instance,
			new MDCLineRippleFoundation({
				addClass,
				removeClass,
				hasClass,
				setStyle: addStyle,
				registerEventHandler: (evtType, handler) => eventManager.on(getElement(), evtType, handler),
				deregisterEventHandler: (evtType, handler) => eventManager.off(getElement(), evtType, handler)
			}),
			true
		);

		$.get(instance).init();

		return () => {
			$.get(instance)?.destroy();
			$.set(instance, undefined);
			eventManager.clear();
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

	function activate() {
		$.get(instance)?.activate();
	}

	function deactivate() {
		$.get(instance)?.deactivate();
	}

	function setRippleCenter(xCoordinate) {
		$.get(instance)?.setRippleCenter(xCoordinate);
	}

	function getElement() {
		return element;
	}

	var $$exports = { activate, deactivate, setRippleCenter, getElement };
	var div = root();

	$.attribute_effect(div, ($0, $1) => ({ class: $0, style: $1, ...restProps }), [
		() => classMap({
			'mdc-line-ripple': true,
			'mdc-line-ripple--active': active(),
			...internalClasses,
			[className()]: true
		}),
		() => Object.entries(internalStyles).map(([name, value]) => `${name}: ${value};`).concat([style()]).join(' ')
	]);

	$.bind_this(div, ($$value) => element = $$value, () => element);
	$.action(div, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
	$.append($$anchor, div);

	return $.pop($$exports);
}