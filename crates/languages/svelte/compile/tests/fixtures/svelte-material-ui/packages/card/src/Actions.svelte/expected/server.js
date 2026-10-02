import * as $ from 'svelte/internal/server';
import { setContext } from 'svelte';
import { classMap, useActions } from '@smui/common/internal';

export default function Actions($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		/**
		 * Style the actions to stretch across the full card.
		 */
		let {
			use = [],
			class: className = '',
			fullBleed = false,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;

		setContext('SMUI:button:context', 'card:action');
		setContext('SMUI:icon-button:context', 'card:action');

		function getElement() {
			return element;
		}

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(classMap({
				'mdc-card__actions': true,
				'mdc-card__actions--full-bleed': fullBleed,
				[className]: true
			})),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { getElement });
	});
}