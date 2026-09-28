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

var root = $.from_html(`<i><!></i>`);

export default function LeadingIcon($$anchor, $$props) {
	$.push($$props, true);

	const $filter = () => $.store_get(filter, '$filter', $$stores);
	const $isSelected = () => $.store_get(isSelected, '$isSelected', $$stores);
	const $leadingIconClasses = () => $.store_get(leadingIconClasses, '$leadingIconClasses', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		restProps = $.rest_props($$props, rest_excludes);

	const filter = getContext('SMUI:chips:filter');
	const isSelected = getContext('SMUI:chips:chip:isSelected');
	const leadingIconClasses = getContext('SMUI:chips:chip:leadingIconClasses');
	let element;

	function getElement() {
		return element;
	}

	var $$exports = { getElement };
	var i = root();

	$.attribute_effect(i, ($0) => ({ class: $0, ...restProps }), [
		() => classMap({
			'mdc-chip__icon': true,
			'mdc-chip__icon--leading': true,
			'mdc-chip__icon--leading-hidden': $filter() && $isSelected(),
			...$leadingIconClasses(),
			[className()]: true
		})
	]);

	var node = $.child(i);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(i);
	$.bind_this(i, ($$value) => element = $$value, () => element);
	$.action(i, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
	$.append($$anchor, i);

	var $$pop = $.pop($$exports);

	$$cleanup();

	return $$pop;
}