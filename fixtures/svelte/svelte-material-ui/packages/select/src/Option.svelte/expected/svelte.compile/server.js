import * as $ from 'svelte/internal/server';
import { onMount, onDestroy, getContext, setContext } from 'svelte';
import { Item } from '@smui/list';

export default function Option($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		/**
		 * The value of the input.
		 */
		let {
			use = [],
			class: className = '',
			value = '',
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;
		const selectedText = getContext('SMUI:select:selectedText');
		const selectedValue = getContext('SMUI:select:value');

		setContext('SMUI:list:item:role', 'option');

		const selected = $.derived(() => value != null && value !== '' && $.store_get($$store_subs ??= {}, '$selectedValue', selectedValue) === value);

		onMount(setSelectedText);
		onDestroy(setSelectedText);

		function setSelectedText() {
			if (selected() && element) {
				$.store_set(selectedText, element.getPrimaryText());
			}
		}

		function getElement() {
			return element.getElement();
		}

		Item($$renderer, $.spread_props([
			{ use, 'data-value': value, value, selected: selected() },
			restProps,
			{
				children: ($$renderer) => {
					children?.($$renderer);
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			}
		]));

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { getElement });
	});
}