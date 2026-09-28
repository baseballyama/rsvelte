import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';
import { classMap } from './internal/index.js';
import { SmuiElement, Svg } from './index.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'on',
	'component',
	'tag',
	'children'
]);

export default function CommonIcon($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * Whether the icon is toggled.
	 */
	/**
	 * The component to use to render the element.
	 */
	/**
	 * The tag name of the element to create.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		on = $.prop($$props, 'on', 3, false),
		MyComponent = $.prop($$props, 'component', 3, SmuiElement),
		tag = $.prop($$props, 'tag', 3, 'i'),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	const svg = $.derived(() => tag() === 'svg' || MyComponent() === Svg);
	const context = getContext('SMUI:icon:context');

	function getElement() {
		return element.getElement();
	}

	var $$exports = { getElement };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => classMap({
			'mdc-button__icon': context === 'button',
			'mdc-fab__icon': context === 'fab',
			'mdc-icon-button__icon': context === 'icon-button',
			'mdc-icon-button__icon--on': context === 'icon-button' && on(),
			'mdc-tab__icon': context === 'tab',
			'mdc-banner__icon': context === 'banner',
			'mdc-segmented-button__icon': context === 'segmented-button',
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
						'aria-hidden': 'true'
					},
					() => $.get(svg) ? { focusable: 'false', tabindex: '-1' } : {},
					() => restProps,
					{
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