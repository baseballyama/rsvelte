import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { classMap, useActions } from '@smui/common/internal';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'children'
]);

var root = $.from_html(`<span role="gridcell"><i><!></i></span>`);

export default function TrailingIcon($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		restProps = $.rest_props($$props, rest_excludes);

	let element;

	function getElement() {
		return element;
	}

	var $$exports = { getElement };
	var span = root();
	var i = $.child(span);

	$.attribute_effect(i, ($0) => ({ class: $0, ...restProps }), [
		() => classMap({
			'mdc-chip__icon': true,
			'mdc-chip__icon--trailing': true,
			[className()]: true
		})
	]);

	var node = $.child(i);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(i);
	$.reset(span);
	$.bind_this(span, ($$value) => element = $$value, () => element);
	$.action(span, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
	$.append($$anchor, span);

	return $.pop($$exports);
}