import * as $ from 'svelte/internal/server';
import { classMap, useActions } from '@smui/common/internal';

export default function Group($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		/**
		 * The styling variant of the button group.
		 */
		// Remember to update $$Props if you add/remove/rename props.
		let {
			use = [],
			class: className = '',
			variant = 'text',
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
				'smui-button__group': true,
				'smui-button__group--raised': variant === 'raised',
				[className]: true
			})),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { getElement });
	});
}