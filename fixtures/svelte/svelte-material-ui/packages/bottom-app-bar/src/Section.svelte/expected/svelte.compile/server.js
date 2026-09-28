import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';
import { classMap } from '@smui/common/internal';
import Paper from '@smui/paper';

export default function Section($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		/**
		 * Use an inset cutout styling for the FAB.
		 */
		let {
			use = [],
			class: className = '',
			fabInset = false,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;
		const color = getContext('SMUI:bottom-app-bar:color');

		function getElement() {
			return element.getElement();
		}

		Paper($$renderer, $.spread_props([
			{
				use,
				class: classMap({
					'smui-bottom-app-bar__section': true,
					'smui-bottom-app-bar__section--fab-inset': fabInset,
					[className]: true
				}),
				color: $.store_get($$store_subs ??= {}, '$color', color),
				variant: 'unelevated',
				square: true
			},
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