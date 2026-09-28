import * as $ from 'svelte/internal/server';
import { exclude, prefixFilter } from '@smui/common/internal';
import Button from '@smui/button';

export default function _ExcludeAndPrefixFilterComponent($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: className = '',
			button$class = '',
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<div${$.attributes({
			class: `my-component ${$.stringify(className)}`,
			...exclude(restProps, ['button$'])
		})}>`);

		Button($$renderer, $.spread_props([
			{ class: `button ${$.stringify(button$class)}` },
			prefixFilter(restProps, 'button$'),
			{
				children: ($$renderer) => {
					children?.($$renderer);
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			}
		]));

		$$renderer.push(`<!----></div>`);
	});
}