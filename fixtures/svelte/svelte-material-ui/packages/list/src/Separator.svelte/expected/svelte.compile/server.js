import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';
import { classMap } from '@smui/common/internal';
import { SmuiElement } from '@smui/common';

export default function Separator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		let {
			use = [],
			class: className = '',
			padded = false,
			inset = false,
			insetLeading = false,
			insetTrailing = false,
			insetPadding = false,
			component: MyComponent = SmuiElement,
			tag = nav || context !== 'list' ? 'hr' : 'li',
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;

		function getElement() {
			return element.getElement();
		}

		if (MyComponent) {
			$$renderer.push('<!--[-->');

			MyComponent($$renderer, $.spread_props([
				{
					tag,
					use,
					class: classMap({
						'mdc-deprecated-list-divider': true,
						'mdc-deprecated-list-divider--padded': padded,
						'mdc-deprecated-list-divider--inset': inset,
						'mdc-deprecated-list-divider--inset-leading': insetLeading,
						'mdc-deprecated-list-divider--inset-trailing': insetTrailing,
						'mdc-deprecated-list-divider--inset-padding': insetPadding,
						[className]: true
					}),
					role: 'separator'
				},
				restProps
			]));

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$.bind_props($$props, { getElement });
	});
}