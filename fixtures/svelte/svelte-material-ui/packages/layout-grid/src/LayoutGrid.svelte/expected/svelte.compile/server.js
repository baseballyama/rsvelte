import * as $ from 'svelte/internal/server';
import { classMap, exclude, prefixFilter, useActions } from '@smui/common/internal';
import InnerGrid from './InnerGrid.svelte';

export default function LayoutGrid($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		/**
		 * Whether to use a fixed column width instead of variable.
		 */
		/**
		 * Where to align the cells horizontally, if not default.
		 */
		let {
			use = [],
			class: className = '',
			fixedColumnWidth = false,
			align = undefined,
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
				'mdc-layout-grid': true,
				'mdc-layout-grid--fixed-column-width': fixedColumnWidth,
				['mdc-layout-grid--align-' + align]: align != null,
				[className]: true
			})),
			...exclude(restProps, ['innerGrid$'])
		})}>`);

		InnerGrid($$renderer, $.spread_props([
			prefixFilter(restProps, 'innerGrid$'),
			{
				children: ($$renderer) => {
					children?.($$renderer);
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			}
		]));

		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { getElement });
	});
}