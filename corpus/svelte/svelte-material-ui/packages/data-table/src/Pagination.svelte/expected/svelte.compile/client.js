import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setContext } from 'svelte';
import { classMap, exclude, prefixFilter, useActions } from '@smui/common/internal';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'trailing$use',
	'trailing$class',
	'children',
	'rowsPerPage',
	'total'
]);

var root = $.from_html(`<div class="mdc-data-table__pagination-rows-per-page"><!></div>`);
var root_1 = $.from_html(`<div class="mdc-data-table__pagination-total"><!></div>`);
var root_2 = $.from_html(`<div><div><!> <div class="mdc-data-table__pagination-navigation"><!> <!></div></div></div>`);

export default function Pagination($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * A spot for the rows per page selector or indicator.
	 */
	/**
	 * A spot for the count and total count.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		trailing$use = $.prop($$props, 'trailing$use', 19, () => []),
		trailing$class = $.prop($$props, 'trailing$class', 3, ''),
		restProps = $.rest_props($$props, rest_excludes);

	let element;

	setContext('SMUI:label:context', 'data-table:pagination');
	setContext('SMUI:select:context', 'data-table:pagination');
	setContext('SMUI:icon-button:context', 'data-table:pagination');

	function getElement() {
		return element;
	}

	var $$exports = { getElement };
	var div = root_2();

	$.attribute_effect(div, ($0, $1) => ({ class: $0, ...$1 }), [
		() => classMap({ 'mdc-data-table__pagination': true, [className()]: true }),
		() => exclude(restProps, ['trailing$'])
	]);

	var div_1 = $.child(div);

	$.attribute_effect(div_1, ($0, $1) => ({ class: $0, ...$1 }), [
		() => classMap({
			'mdc-data-table__pagination-trailing': true,
			[trailing$class()]: true
		}),
		() => prefixFilter(restProps, 'trailing$')
	]);

	var node = $.child(div_1);

	{
		var consequent = ($$anchor) => {
			var div_2 = root();
			var node_1 = $.child(div_2);

			$.snippet(node_1, () => $$props.rowsPerPage ?? $.noop);
			$.reset(div_2);
			$.append($$anchor, div_2);
		};

		$.if(node, ($$render) => {
			if ($$props.rowsPerPage) $$render(consequent);
		});
	}

	var div_3 = $.sibling(node, 2);
	var node_2 = $.child(div_3);

	{
		var consequent_1 = ($$anchor) => {
			var div_4 = root_1();
			var node_3 = $.child(div_4);

			$.snippet(node_3, () => $$props.total ?? $.noop);
			$.reset(div_4);
			$.append($$anchor, div_4);
		};

		$.if(node_2, ($$render) => {
			if ($$props.total) $$render(consequent_1);
		});
	}

	var node_4 = $.sibling(node_2, 2);

	$.snippet(node_4, () => $$props.children ?? $.noop);
	$.reset(div_3);
	$.reset(div_1);
	$.action(div_1, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), trailing$use);
	$.reset(div);
	$.bind_this(div, ($$value) => element = $$value, () => element);
	$.action(div, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
	$.append($$anchor, div);

	return $.pop($$exports);
}