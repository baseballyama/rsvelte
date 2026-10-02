import * as $ from 'svelte/internal/server';
import { T, useThrelte } from '@threlte/core';
import { useHeadset } from '../hooks/useHeadset.js';

export default function Headset($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { children } = $$props;
		const { scene } = useThrelte();
		const headset = useHeadset();

		T($$renderer, {
			is: headset,
			attach: scene,
			children: ($$renderer) => {
				children?.($$renderer, { ref: headset });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	});
}