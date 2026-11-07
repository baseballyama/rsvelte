import * as $ from 'svelte/internal/server';
import { setContext } from 'svelte';
import { writable } from 'svelte/store';
import { classMap, useActions } from '@smui/common/internal';

export default function Wrapper($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		/**
		 * Whether this wrapper is for a rich tooltip.
		 *
		 * Rich tooltips can have more than just text content. They are also
		 * automatically wrapped in a div.
		 */
		let {
			use = [],
			class: className = '',
			rich = false,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;
		const anchor = writable(undefined);
		const tooltip = writable(undefined);

		setContext('SMUI:tooltip:wrapper:anchor', anchor);
		setContext('SMUI:tooltip:wrapper:tooltip', tooltip);
		setContext('SMUI:tooltip:rich', rich);

		function getElement() {
			return element;
		}

		if (rich) {
			$$renderer.push(`<!--[0--><div${$.attributes({
				class: $.clsx(classMap({ 'mdc-tooltip-wrapper--rich': true, [className]: true })),
				...restProps
			})}>`);

			children?.($$renderer);
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
			children?.($$renderer);
			$$renderer.push(`<!---->`);
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { getElement });
	});
}