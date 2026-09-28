import * as $ from 'svelte/internal/server';
import { classMap, dispatch } from '@smui/common/internal';
import { SmuiElement } from '@smui/common';

export default function Scrim($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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
		let {
			use = [],
			class: className = '',
			fixed = true,
			component: MyComponent = SmuiElement,
			tag = 'div',
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;

		function handleClick(event) {
			dispatch(getElement(), 'SMUIDrawerScrimClick', event);
		}

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
						'mdc-drawer-scrim': true,
						'smui-drawer-scrim__absolute': !fixed,
						[className]: true
					})
				},
				restProps,
				{
					onclick: (e) => {
						handleClick(e);
						restProps.onclick?.(e);
					},

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