import * as $ from 'svelte/internal/server';
import { T, useThrelte } from '@threlte/core';
import { ShaderMaterial, Color, Vector2, Uniform, Texture } from 'three';
import { fragmentShader } from './fragment.js';
import { vertexShader } from './vertex.js';

export default function MeshLineMaterial($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			opacity = 1,
			color = '#ffffff',
			dashOffset = 0,
			dashArray = 0,
			dashRatio = 0,
			attenuate = true,
			width = 1,
			scaleDown = 0,
			alphaMap,
			ref = void 0,
			children,
			$$slots,
			$$events,
			...props
		} = $$props;

		let { invalidate, size } = useThrelte();

		const uniforms = {
			lineWidth: new Uniform(1),
			color: new Uniform(new Color('#ffffff')),
			opacity: new Uniform(1),
			resolution: new Uniform(new Vector2(1, 1)),
			sizeAttenuation: new Uniform(1),
			dashArray: new Uniform(0),
			useDash: new Uniform(0),
			dashOffset: new Uniform(0),
			dashRatio: new Uniform(0),
			scaleDown: new Uniform(0),
			alphaMap: new Uniform(undefined),
			useAlphaMap: new Uniform(0)
		};

		const material = new ShaderMaterial({ uniforms });
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			T($$renderer, $.spread_props([
				{ is: material, fragmentShader, vertexShader },
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

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { ref, material });
	});
}