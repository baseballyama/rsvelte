import * as $ from 'svelte/internal/server';
import { Mesh } from 'three';
import { T, useLoader } from '@threlte/core';
import { useGltf, MeshRefractionMaterial, useDraco } from '@threlte/extras';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

export default function Diamond($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { $$slots, $$events, ...props } = $$props;
		const dracoLoader = useDraco();
		const gltf = useGltf('/models/diamond/dflat.glb', { dracoLoader });
		const env = useLoader(RGBELoader).load('/textures/equirectangular/hdr/aerodynamics_workshop_1k.hdr');

		$.await($$renderer, gltf, () => {}, ({ nodes }) => {
			if (T.Mesh) {
				$$renderer.push('<!--[-->');

				T.Mesh($$renderer, $.spread_props([
					{
						castShadow: true,
						receiveShadow: true,
						geometry: nodes.Diamond_1_0.geometry
					},
					props,
					{
						children: ($$renderer) => {
							$.await($$renderer, env, () => {}, (e) => {
								MeshRefractionMaterial($$renderer, {
									envMap: e,
									fresnel: 0.5,
									ior: 2.75,
									aberrationStrength: 0.04,
									bounces: 3,
									color: '#ffdddd'
								});
							});

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					}
				]));

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		});

		$$renderer.push(`<!--]-->`);
	});
}