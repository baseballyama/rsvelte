import * as $ from 'svelte/internal/server';
import { T, useThrelte } from '@threlte/core';
import { Color, AdditiveBlending, ShaderMaterial } from 'three';
import { fragmentShader } from './fragment.js';
import { vertexShader } from './vertex.js';

export default function FakeGlowMaterial($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			falloff = 0.1,
			glowInternalRadius = 6.0,
			glowColor = 'green',
			glowSharpness = 1.0,
			ref = void 0,
			children,
			$$slots,
			$$events,
			...props
		} = $$props;

		const uniforms = {
			falloff: { value: falloff },
			glowInternalRadius: { value: glowInternalRadius },
			glowColor: { value: new Color(glowColor) },
			glowSharpness: { value: glowSharpness }
		};

		const material = new ShaderMaterial({
			uniforms,
			fragmentShader,
			vertexShader,
			transparent: true,
			blending: AdditiveBlending,
			depthTest: false
		});

		const { invalidate } = useThrelte();
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			T($$renderer, $.spread_props([
				{ is: material },
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
		$.bind_props($$props, { ref });
	});
}