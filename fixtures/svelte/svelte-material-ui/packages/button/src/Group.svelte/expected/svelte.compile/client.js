import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { classMap, useActions } from '@smui/common/internal';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'variant',
	'children'
]);

var root = $.from_html(`<div><!></div>`);

export default function Group($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * The styling variant of the button group.
	 */
	// Remember to update $$Props if you add/remove/rename props.
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		variant = $.prop($$props, 'variant', 3, 'text'),
		restProps = $.rest_props($$props, rest_excludes);

	let element;

	function getElement() {
		return element;
	}

	var $$exports = { getElement };
	var div = root();

	$.attribute_effect(div, ($0) => ({ class: $0, ...restProps }), [
		() => classMap({
			'smui-button__group': true,
			'smui-button__group--raised': variant() === 'raised',
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