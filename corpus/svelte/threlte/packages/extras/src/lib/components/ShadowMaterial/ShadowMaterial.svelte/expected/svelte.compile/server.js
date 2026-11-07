import * as $ from 'svelte/internal/server';
import { DoubleSide, MeshBasicMaterial } from 'three';
import RadialGradientTexture from '../GradientTexture/radial/RadialGradientTexture.svelte';
import { T } from '@threlte/core';

const width = 128;
const height = width;
const outerRadius = 0.5 * width;
const end = { color: 'rgba(0,0,0,0)', offset: 1 };

export default function ShadowMaterial($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			color = 'black',
			ref = void 0,
			transparent = true,
			opacity = 0.5,
			depthWrite = false,
			side = DoubleSide,
			fog = false,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const start = $.derived(() => ({ color, offset: 0 }));
		const stops = $.derived(() => [start(), end]);
		const material = new MeshBasicMaterial();
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			T($$renderer, $.spread_props([
				{ is: material, transparent, side, depthWrite, fog, opacity },
				restProps,
				{
					get ref() {
						return ref;
					},

					set ref($$value) {
						ref = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						RadialGradientTexture($$renderer, { width, height, outerRadius, stops: stops() });
						$$renderer.push(`<!----> `);
						children?.($$renderer, { ref: material });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				}
			]));
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { ref });
	});
}