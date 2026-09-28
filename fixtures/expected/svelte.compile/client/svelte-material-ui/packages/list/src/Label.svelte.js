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

var root = $.from_html(`<label><!></label>`);

export default function Label($$anchor, $$props) {
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
	let inputProps = getContext('SMUI:generic:input:props') ?? {};

	function getElement() {
		return element;
	}

	var $$exports = { getElement };
	var label = root();

	$.attribute_effect(
		label,
		($0) => ({
			class: $0,
			for: inputProps ? inputProps.id : undefined,
			...restProps
		}),
		[
			() => classMap({ 'mdc-deprecated-list-item__text': true, [className()]: true })
		]
	);

	var node = $.child(label);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(label);
	$.bind_this(label, ($$value) => element = $$value, () => element);
	$.action(label, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
	$.append($$anchor, label);

	return $.pop($$exports);
}