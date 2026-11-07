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
	'align',
	'toolbar',
	'children'
]);

var root = $.from_html(`<section><!></section>`);

export default function Section($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * Where to align the element.
	 */
	/**
	 * Whether this section acts as a toolbar.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		align = $.prop($$props, 'align', 3, 'start'),
		toolbar = $.prop($$props, 'toolbar', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	let element;

	setContext('SMUI:icon-button:context', toolbar() ? 'top-app-bar:action' : 'top-app-bar:navigation');
	setContext('SMUI:button:context', toolbar() ? 'top-app-bar:action' : 'top-app-bar:navigation');

	function getElement() {
		return element;
	}

	var $$exports = { getElement };
	var section = root();

	$.attribute_effect(
		section,
		($0) => ({
			class: $0,
			...toolbar() ? { role: 'toolbar' } : {},
			...restProps
		}),
		[
			() => classMap({
				'mdc-top-app-bar__section': true,
				'mdc-top-app-bar__section--align-start': align() === 'start',
				'mdc-top-app-bar__section--align-end': align() === 'end',
				[className()]: true
			})
		]
	);

	var node = $.child(section);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(section);
	$.bind_this(section, ($$value) => element = $$value, () => element);
	$.action(section, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
	$.append($$anchor, section);

	return $.pop($$exports);
}