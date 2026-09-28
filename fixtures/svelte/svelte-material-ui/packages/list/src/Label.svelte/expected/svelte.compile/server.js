import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';
import { classMap, useActions } from '@smui/common/internal';

export default function Label($$renderer, $$props) {
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
		let inputProps = getContext('SMUI:generic:input:props') ?? {};

		function getElement() {
			return element;
		}

		$$renderer.push(`<label${$.attributes({
			class: $.clsx(classMap({ 'mdc-deprecated-list-item__text': true, [className]: true })),
			for: inputProps ? inputProps.id : undefined,
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></label>`);
		$.bind_props($$props, { getElement });
	});
}