import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { classMap, exclude, prefixFilter, useActions } from '@smui/common/internal';
import InnerGrid from './InnerGrid.svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'fixedColumnWidth',
	'align',
	'children'
]);

var root = $.from_html(`<div><!></div>`);

export default function LayoutGrid($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * Whether to use a fixed column width instead of variable.
	 */
	/**
	 * Where to align the cells horizontally, if not default.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		fixedColumnWidth = $.prop($$props, 'fixedColumnWidth', 3, false),
		align = $.prop($$props, 'align', 3, undefined),
		restProps = $.rest_props($$props, rest_excludes);

	let element;

	function getElement() {
		return element;
	}

	var $$exports = { getElement };
	var div = root();

	$.attribute_effect(div, ($0, $1) => ({ class: $0, ...$1 }), [
		() => classMap({
			'mdc-layout-grid': true,
			'mdc-layout-grid--fixed-column-width': fixedColumnWidth(),
			['mdc-layout-grid--align-' + align()]: align() != null,
			[className()]: true
		}),
		() => exclude(restProps, ['innerGrid$'])
	]);

	var node = $.child(div);

	{
		let $0 = $.derived(() => prefixFilter(restProps, 'innerGrid$'));

		InnerGrid(node, $.spread_props(() => $.get($0), {
			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				$.snippet(node_1, () => $$props.children ?? $.noop);
				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		}));
	}

	$.reset(div);
	$.bind_this(div, ($$value) => element = $$value, () => element);
	$.action(div, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
	$.append($$anchor, div);

	return $.pop($$exports);
}