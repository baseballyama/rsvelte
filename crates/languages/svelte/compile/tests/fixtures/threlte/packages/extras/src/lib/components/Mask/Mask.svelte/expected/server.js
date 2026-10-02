import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { ReplaceStencilOp, AlwaysStencilFunc, Mesh } from 'three';

export default function Mask($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/*
		  A port of drei's Mask component:
				https://github.com/pmndrs/drei/blob/c147c2b1064bc4b457150f995bf714c2e43cf56f/src/core/Mask.tsx#L38
				*/
		let {
			id = 1,
			colorWrite = false,
			depthWrite = false,
			ref = void 0,
			children,
			$$slots,
			$$events,
			...props
		} = $$props;

		const mesh = new Mesh();
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			T($$renderer, $.spread_props([
				{ is: mesh, renderOrder: -id },
				props,
				{
					get ref() {
						return ref;
					},

					set ref($$value) {
						ref = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						children?.($$renderer, { ref: mesh });
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