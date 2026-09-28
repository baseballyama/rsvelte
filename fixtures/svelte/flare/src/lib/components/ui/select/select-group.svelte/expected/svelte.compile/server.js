import * as $ from 'svelte/internal/server';
import { Select as SelectPrimitive } from 'bits-ui';

export default function Select_group($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { ref = null, $$slots, $$events, ...restProps } = $$props;

		if (SelectPrimitive.Group) {
			$$renderer.push('<!--[-->');
			SelectPrimitive.Group($$renderer, $.spread_props([{ 'data-slot': 'select-group' }, restProps]));
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$.bind_props($$props, { ref });
	});
}