import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';
import { classMap, useActions } from '@smui/common/internal';

export default function LeadingIcon($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

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

		const filter = getContext('SMUI:chips:filter');
		const isSelected = getContext('SMUI:chips:chip:isSelected');
		const leadingIconClasses = getContext('SMUI:chips:chip:leadingIconClasses');
		let element;

		function getElement() {
			return element;
		}

		$$renderer.push(`<i${$.attributes({
			class: $.clsx(classMap({
				'mdc-chip__icon': true,
				'mdc-chip__icon--leading': true,
				'mdc-chip__icon--leading-hidden': $.store_get($$store_subs ??= {}, '$filter', filter) && $.store_get($$store_subs ??= {}, '$isSelected', isSelected),
				...$.store_get($$store_subs ??= {}, '$leadingIconClasses', leadingIconClasses),
				[className]: true
			})),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></i>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { getElement });
	});
}