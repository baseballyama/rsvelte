import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { classMap, useActions } from '@smui/common/internal';
import Ripple from '@smui/ripple';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'style',
	'ripple',
	'color',
	'padded',
	'tabindex',
	'children'
]);

var root = $.from_html(`<div><div class="mdc-card__ripple"></div> <!></div>`);

export default function PrimaryAction($$anchor, $$props) {
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
	 * Whether to show a ripple animation.
	 */
	/**
	 * The color of the action.
	 */
	/**
	 * Whether to add padding.
	 */
	/**
	 * The tab index.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		style = $.prop($$props, 'style', 3, ''),
		ripple = $.prop($$props, 'ripple', 3, true),
		padded = $.prop($$props, 'padded', 3, false),
		tabindex = $.prop($$props, 'tabindex', 3, 0),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	let internalClasses = $.proxy({});
	let internalStyles = $.proxy({});

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

	function getElement() {
		return element;
	}

	var $$exports = { getElement };
	var div = root();

	$.attribute_effect(
		div,
		($0, $1) => ({
			class: $0,
			style: $1,
			tabindex: tabindex(),
			role: 'button',
			...restProps
		}),
		[
			() => classMap({
				'mdc-card__primary-action': true,
				'smui-card__primary-action--padded': padded(),
				...internalClasses,
				[className()]: true
			}),
			() => Object.entries(internalStyles).map(([name, value]) => `${name}: ${value};`).concat([style()]).join(' ')
		]
	);

	var node = $.sibling($.child(div), 2);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.bind_this(div, ($$value) => element = $$value, () => element);
	$.action(div, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);

	$.action(div, ($$node, $$action_arg) => Ripple?.($$node, $$action_arg), () => ({
		ripple: ripple(),
		unbounded: false,
		color: $$props.color,
		addClass,
		removeClass,
		addStyle
	}));

	$.append($$anchor, div);

	return $.pop($$exports);
}