import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { classMap, useActions } from '@smui/common/internal';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'align',
	'order',
	'span',
	'spanDevices',
	'children'
]);

var root = $.from_html(`<div><!></div>`);

export default function Cell($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * Where to align this cell, vertically.
	 */
	/**
	 * Change the order of this cell.
	 */
	/**
	 * How many columns this cell should span.
	 *
	 * This number is out of 12 on desktop, 8 on tablet, and 4 on mobile.
	 */
	/**
	 * How many columns this cell should span on different size screens.
	 *
	 * This number is out of 12 on desktop, 8 on tablet, and 4 on mobile.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		align = $.prop($$props, 'align', 3, undefined),
		order = $.prop($$props, 'order', 3, undefined),
		span = $.prop($$props, 'span', 3, undefined),
		spanDevices = $.prop($$props, 'spanDevices', 19, () => ({})),
		restProps = $.rest_props($$props, rest_excludes);

	let element;

	function getElement() {
		return element;
	}

	var $$exports = { getElement };
	var div = root();

	$.attribute_effect(div, ($0) => ({ class: $0, ...restProps }), [
		() => classMap({
			'mdc-layout-grid__cell': true,
			['mdc-layout-grid__cell--align-' + align()]: align() != null,
			['mdc-layout-grid__cell--order-' + order()]: order() != null,
			['mdc-layout-grid__cell--span-' + span()]: span() != null,
			...Object.fromEntries(Object.entries(spanDevices()).map(([device, span]) => [`mdc-layout-grid__cell--span-${span}-${device}`, true])),
			[className()]: true
		})
	]);

	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.bind_this(div, ($$value) => element = $$value, () => element);
	$.action(div, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
	$.append($$anchor, div);

	return $.pop($$exports);
}