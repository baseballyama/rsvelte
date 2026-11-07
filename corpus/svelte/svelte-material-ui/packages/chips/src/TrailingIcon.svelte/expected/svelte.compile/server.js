import * as $ from 'svelte/internal/server';
import { classMap, useActions } from '@smui/common/internal';

export default function TrailingIcon($$renderer, $$props) {
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

		function getElement() {
			return element;
		}

		$$renderer.push(`<span role="gridcell"><i${$.attributes({
			class: $.clsx(classMap({
				'mdc-chip__icon': true,
				'mdc-chip__icon--trailing': true,
				[className]: true
			})),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></i></span>`);
		$.bind_props($$props, { getElement });
	});
}