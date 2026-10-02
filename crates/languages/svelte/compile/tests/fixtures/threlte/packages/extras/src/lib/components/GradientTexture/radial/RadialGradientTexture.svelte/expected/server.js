import * as $ from 'svelte/internal/server';
import { CanvasTexture, ClampToEdgeWrapping } from 'three';
import { T, useThrelte } from '@threlte/core';
import { addStops } from '../common.js';
import { untrack } from 'svelte';

export default function RadialGradientTexture($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			width = 1024,
			height = 1024,
			innerRadius = 0,
			outerRadius = 'auto',
			stops = [{ offset: 0, color: 'black' }, { offset: 1, color: 'white' }],
			wrapS = ClampToEdgeWrapping,
			wrapT = ClampToEdgeWrapping,
			attach = 'map',
			children,
			ref = void 0,
			$$slots,
			$$events,
			...props
		} = $$props;

		const canvas = new OffscreenCanvas(untrack(() => width), untrack(() => height));
		const context = canvas.getContext('2d');

		if (context === null) {
			throw new Error('radial gradient texture context is null');
		}

		const texture = new CanvasTexture(canvas);

		const gradient = $.derived(() => {
			const halfWidth = 0.5 * width;
			const halfHeight = 0.5 * height;
			const gradient = context.createRadialGradient(halfWidth, halfHeight, innerRadius, halfWidth, halfHeight, outerRadius === 'auto' ? Math.hypot(halfWidth, halfHeight) : outerRadius);

			addStops(gradient, stops);

			return gradient;
		});

		const { invalidate } = useThrelte();
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			T($$renderer, $.spread_props([
				{ is: texture },
				props,
				{
					attach,
					get ref() {
						return ref;
					},

					set ref($$value) {
						ref = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						children?.($$renderer, { ref: texture });
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