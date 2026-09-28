import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';

export default function Flower($$renderer, $$props) {
	let { children, $$slots, $$events, ...rest } = $$props;

	if (T.Group) {
		$$renderer.push('<!--[-->');

		T.Group($$renderer, $.spread_props([
			rest,
			{
				children: ($$renderer) => {
					children?.($$renderer);
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			}
		]));

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}