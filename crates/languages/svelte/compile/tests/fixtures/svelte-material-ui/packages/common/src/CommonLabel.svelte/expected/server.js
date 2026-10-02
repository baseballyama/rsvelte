import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';
import { classMap } from './internal/index.js';
import { SmuiElement } from './index.js';

export default function CommonLabel($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * A space separated list of CSS classes.
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
			component: MyComponent = SmuiElement,
			tag = 'span',
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;
		const context = getContext('SMUI:label:context');
		const tabindex = getContext('SMUI:label:tabindex');

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
						'mdc-button__label': context === 'button',
						'mdc-fab__label': context === 'fab',
						'mdc-tab__text-label': context === 'tab',
						'mdc-image-list__label': context === 'image-list',
						'mdc-snackbar__label': context === 'snackbar',
						'mdc-banner__text': context === 'banner',
						'mdc-segmented-button__label': context === 'segmented-button',
						'mdc-data-table__pagination-rows-per-page-label': context === 'data-table:pagination',
						'mdc-data-table__header-cell-label': context === 'data-table:sortable-header-cell',
						'mdc-tooltip__label': context === 'tooltip',
						[className]: true
					})
				},
				context === 'snackbar' ? { 'aria-atomic': 'false' } : {},
				{ tabindex },
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