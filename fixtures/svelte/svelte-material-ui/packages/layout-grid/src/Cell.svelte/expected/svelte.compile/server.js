import * as $ from 'svelte/internal/server';
import { classMap, useActions } from '@smui/common/internal';

export default function Cell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		/**
		 * Where to align this cell, vertically.
		 */
		/**
		 * Change the order of this cell.
		 */
		/**
		 * How many columns this cell should span.
		 *
		 * This number is out of 12 on desktop, 8 on tablet, and 4 on mobile.
		 */
		/**
		 * How many columns this cell should span on different size screens.
		 *
		 * This number is out of 12 on desktop, 8 on tablet, and 4 on mobile.
		 */
		let {
			use = [],
			class: className = '',
			align = undefined,
			order = undefined,
			span = undefined,
			spanDevices = {},
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;

		function getElement() {
			return element;
		}

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(classMap({
				'mdc-layout-grid__cell': true,
				['mdc-layout-grid__cell--align-' + align]: align != null,
				['mdc-layout-grid__cell--order-' + order]: order != null,
				['mdc-layout-grid__cell--span-' + span]: span != null,
				...Object.fromEntries(Object.entries(spanDevices).map(([device, span]) => [`mdc-layout-grid__cell--span-${span}-${device}`, true])),
				[className]: true
			})),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { getElement });
	});
}