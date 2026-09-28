import * as $ from 'svelte/internal/server';
import { extractLayerProps } from '$lib/utils/attributes.js';

export default function ColorRamp($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			interpolator,
			steps = 10,
			height = '20px',
			width = '100%',
			ref: refProp = void 0,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let ref = void 0;
		let href = '';

		$$renderer.push(`<image${$.attributes(
			{
				href,
				preserveAspectRatio: 'none',
				height,
				width,
				...extractLayerProps(restProps, 'lc-color-ramp')
			},
			void 0,
			void 0,
			void 0,
			3
		)}></image>`);

		$.bind_props($$props, { ref: refProp });
	});
}