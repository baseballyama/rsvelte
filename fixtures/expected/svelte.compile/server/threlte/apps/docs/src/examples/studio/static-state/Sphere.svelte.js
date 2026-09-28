import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { SceneConfig } from './config.svelte';

export default function Sphere($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { $$slots, $$events, ...props } = $$props;
		const sceneConfig = new SceneConfig();

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, $.spread_props([
				props,
				{
					children: ($$renderer) => {
						if (T.SphereGeometry) {
							$$renderer.push('<!--[-->');
							T.SphereGeometry($$renderer, { args: [0.8] });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (T.MeshStandardMaterial) {
							$$renderer.push('<!--[-->');

							T.MeshStandardMaterial($$renderer, {
								color: sceneConfig.color,
								transparent: true,
								opacity: sceneConfig.opacity,
								alphaToCoverage: true
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
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
}