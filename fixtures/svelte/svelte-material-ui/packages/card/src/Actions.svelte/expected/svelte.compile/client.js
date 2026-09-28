import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setContext } from 'svelte';
import { classMap, useActions } from '@smui/common/internal';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'fullBleed',
	'children'
]);

var root = $.from_html(`<div><!></div>`);

export default function Actions($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * Style the actions to stretch across the full card.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		fullBleed = $.prop($$props, 'fullBleed', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	let element;

	setContext('SMUI:button:context', 'card:action');
	setContext('SMUI:icon-button:context', 'card:action');

	function getElement() {
		return element;
	}

	var $$exports = { getElement };
	var div = root();

	$.attribute_effect(div, ($0) => ({ class: $0, ...restProps }), [
		() => classMap({
			'mdc-card__actions': true,
			'mdc-card__actions--full-bleed': fullBleed(),
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