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
	'padded',
	'children'
]);

var root = $.from_html(`<div><!></div>`);

export default function Card($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * The styling variant of the card.
	 */
	/**
	 * Whether to add padding.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		variant = $.prop($$props, 'variant', 3, 'raised'),
		padded = $.prop($$props, 'padded', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	let element;

	function getElement() {
		return element;
	}

	var $$exports = { getElement };
	var div = root();

	$.attribute_effect(div, ($0) => ({ class: $0, ...restProps }), [
		() => classMap({
			'mdc-card': true,
			'mdc-card--outlined': variant() === 'outlined',
			'smui-card--padded': padded(),
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