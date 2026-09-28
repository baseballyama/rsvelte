import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setContext } from 'svelte';
import { classMap, exclude, prefixFilter, useActions } from '@smui/common/internal';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'list$use',
	'list$class',
	'children'
]);

var root = $.from_html(`<li><ul><!></ul></li>`);

export default function SelectionGroup($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		list$use = $.prop($$props, 'list$use', 19, () => []),
		list$class = $.prop($$props, 'list$class', 3, ''),
		restProps = $.rest_props($$props, rest_excludes);

	let element;

	setContext('SMUI:list:graphic:menu-selection-group', true);

	function getElement() {
		return element;
	}

	var $$exports = { getElement };
	var li = root();

	$.attribute_effect(li, ($0) => ({ ...$0 }), [() => exclude(restProps, ['list$'])]);

	var ul = $.child(li);

	$.attribute_effect(ul, ($0, $1) => ({ class: $0, ...$1 }), [
		() => classMap({ 'mdc-menu__selection-group': true, [list$class()]: true }),
		() => prefixFilter(restProps, 'list$')
	]);

	var node = $.child(ul);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(ul);
	$.action(ul, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), list$use);
	$.reset(li);
	$.bind_this(li, ($$value) => element = $$value, () => element);
	$.action(li, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
	$.append($$anchor, li);

	return $.pop($$exports);
}