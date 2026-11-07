import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';
import { classMap } from './internal/index.js';
import { SmuiElement, Svg } from './index.js';

export default function CommonIcon($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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
		let {
			use = [],
			class: className = '',
			on = false,
			component: MyComponent = SmuiElement,
			tag = 'i',
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;
		const svg = $.derived(() => tag === 'svg' || MyComponent === Svg);
		const context = getContext('SMUI:icon:context');

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
						'mdc-button__icon': context === 'button',
						'mdc-fab__icon': context === 'fab',
						'mdc-icon-button__icon': context === 'icon-button',
						'mdc-icon-button__icon--on': context === 'icon-button' && on,
						'mdc-tab__icon': context === 'tab',
						'mdc-banner__icon': context === 'banner',
						'mdc-segmented-button__icon': context === 'segmented-button',
						[className]: true
					}),
					'aria-hidden': 'true'
				},
				svg() ? { focusable: 'false', tabindex: '-1' } : {},
				restProps,
				{
					children: ($$renderer) => {
						children?.($$renderer);
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				}
			]));

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$.bind_props($$props, { getElement });
	});
}