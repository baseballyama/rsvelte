import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { classMap, dispatch } from '@smui/common/internal';
import { SmuiElement } from '@smui/common';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'fixed',
	'component',
	'tag',
	'children'
]);

export default function Scrim($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * Turn this off for non-page-wide drawers.
	 *
	 * This controls whether the drawer uses fixed or absolute positioning.
	 */
	/**
	 * The component to use to render the element.
	 */
	/**
	 * The tag name of the element to create.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		fixed = $.prop($$props, 'fixed', 3, true),
		MyComponent = $.prop($$props, 'component', 3, SmuiElement),
		tag = $.prop($$props, 'tag', 3, 'div'),
		restProps = $.rest_props($$props, rest_excludes);

	let element;

	function handleClick(event) {
		dispatch(getElement(), 'SMUIDrawerScrimClick', event);
	}

	function getElement() {
		return element.getElement();
	}

	var $$exports = { getElement };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => classMap({
			'mdc-drawer-scrim': true,
			'smui-drawer-scrim__absolute': !fixed(),
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
						}
					},
					() => restProps,
					{
						onclick: (e) => {
							handleClick(e);
							$$props.onclick?.(e);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_1 = $.comment();
							var node_1 = $.first_child(fragment_1);

							$.snippet(node_1, () => $$props.children ?? $.noop);
							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					}
				)),
				($$value) => element = $$value,
				() => element
			);
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}