import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { MarchingPlane } from './MarchingPlane';

export default function MarchingPlane_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, $$slots, $$events, ...props } = $$props;
		const plane = new MarchingPlane();

		T($$renderer, $.spread_props([
			{ is: plane },
			props,
			{
				children: ($$renderer) => {
					children?.($$renderer, { ref: plane });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			}
		]));
	});
}