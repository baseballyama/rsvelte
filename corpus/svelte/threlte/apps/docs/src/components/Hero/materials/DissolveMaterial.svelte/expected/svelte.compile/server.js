import * as $ from 'svelte/internal/server';
import { T, useTask } from '@threlte/core';
import { Color, MeshStandardMaterial } from 'three';
import CustomShaderMaterial from 'three-custom-shader-material/vanilla';
import { fragmentShader, vertexShader } from './shaders';

export default function DissolveMaterial($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const CSM = CustomShaderMaterial;

		const material = new CSM({
			baseMaterial: MeshStandardMaterial,
			vertexShader,
			fragmentShader,
			uniforms: {
				uThickness: { value: 0.1 },
				uColor: { value: new Color('#ffffff') },
				uProgress: { value: 0 },
				uSeed: { value: Math.random() },
				uScale: { value: 1 }
			},
			transparent: true,
			toneMapped: false
		});

		let {
			progress,
			scale,
			ref = void 0,
			children,
			$$slots,
			$$events,
			...props
		} = $$props;

		ref = material;

		useTask((delta) => {
			if (material.uniforms.uSeed) material.uniforms.uSeed.value += delta * 0.001;
		});

		T($$renderer, $.spread_props([
			{ is: material },
			props,
			{
				children: ($$renderer) => {
					children?.($$renderer, { ref: material });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			}
		]));

		$.bind_props($$props, { ref });
	});
}