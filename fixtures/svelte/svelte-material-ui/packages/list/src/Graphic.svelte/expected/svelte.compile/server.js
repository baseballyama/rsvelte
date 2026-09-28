import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';
import { classMap, useActions } from '@smui/common/internal';

export default function Graphic($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		let {
			use = [],
			class: className = '',
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;
		let menuSelectionGroup = getContext('SMUI:list:graphic:menu-selection-group');

		function getElement() {
			return element;
		}

		$$renderer.push(`<span${$.attributes({
			class: $.clsx(classMap({
				'mdc-deprecated-list-item__graphic': true,
				'mdc-menu__selection-group-icon': menuSelectionGroup,
				[className]: true
			})),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></span>`);
		$.bind_props($$props, { getElement });
	});
}