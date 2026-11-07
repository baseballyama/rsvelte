import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';
import { classMap, useActions } from '@smui/common/internal';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'children'
]);

var root = $.from_html(`<span><!></span>`);

export default function Graphic($$anchor, $$props) {
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
	let menuSelectionGroup = getContext('SMUI:list:graphic:menu-selection-group');

	function getElement() {
		return element;
	}

	var $$exports = { getElement };
	var span = root();

	$.attribute_effect(span, ($0) => ({ class: $0, ...restProps }), [
		() => classMap({
			'mdc-deprecated-list-item__graphic': true,
			'mdc-menu__selection-group-icon': menuSelectionGroup,
			[className()]: true
		})
	]);

	var node = $.child(span);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(span);
	$.bind_this(span, ($$value) => element = $$value, () => element);
	$.action(span, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
	$.append($$anchor, span);

	return $.pop($$exports);
}