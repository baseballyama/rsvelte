import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';
import { classMap } from '@smui/common/internal';
import { SmuiElement } from '@smui/common';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'padded',
	'inset',
	'insetLeading',
	'insetTrailing',
	'insetPadding',
	'component',
	'tag',
	'children'
]);

export default function Separator($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * Apply padded styling.
	 */
	/**
	 * Apply inset styling.
	 */
	/**
	 * Apply leading inset styling.
	 */
	/**
	 * Apply trailing inset styling.
	 */
	/**
	 * Apply inset padding styling.
	 */
	/**
	 * The component to use to render the element.
	 */
	/**
	 * The tag name of the element to create.
	 */
	let nav = getContext('SMUI:list:item:nav');

	let context = getContext('SMUI:separator:context');

	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		padded = $.prop($$props, 'padded', 3, false),
		inset = $.prop($$props, 'inset', 3, false),
		insetLeading = $.prop($$props, 'insetLeading', 3, false),
		insetTrailing = $.prop($$props, 'insetTrailing', 3, false),
		insetPadding = $.prop($$props, 'insetPadding', 3, false),
		MyComponent = $.prop($$props, 'component', 3, SmuiElement),
		tag = $.prop($$props, 'tag', 3, nav || context !== 'list' ? 'hr' : 'li'),
		restProps = $.rest_props($$props, rest_excludes);

	let element;

	function getElement() {
		return element.getElement();
	}

	var $$exports = { getElement };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => classMap({
			'mdc-deprecated-list-divider': true,
			'mdc-deprecated-list-divider--padded': padded(),
			'mdc-deprecated-list-divider--inset': inset(),
			'mdc-deprecated-list-divider--inset-leading': insetLeading(),
			'mdc-deprecated-list-divider--inset-trailing': insetTrailing(),
			'mdc-deprecated-list-divider--inset-padding': insetPadding(),
			[className()]: true
		}));

		$.component(node, MyComponent, ($$anchor, MyComponent_1) => {
			$.bind_this(
				MyComponent_1($$anchor, $.spread_props(
					{
						get tag() {
							return tag();
						},

						get use() {
							return use();
						},

						get class() {
							return $.get($0);
						},
						role: 'separator'
					},
					() => restProps
				)),
				($$value) => element = $$value,
				() => element
			);
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}