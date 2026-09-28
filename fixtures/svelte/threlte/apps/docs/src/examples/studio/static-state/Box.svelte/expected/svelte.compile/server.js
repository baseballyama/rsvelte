import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { RoundedBoxGeometry } from '@threlte/extras';
import { SceneConfig } from './config.svelte';

export default function Box($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { $$slots, $$events, ...props } = $$props;
		const sceneConfig = new SceneConfig();

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, $.spread_props([
				props,
				{
					children: ($$renderer) => {
						RoundedBoxGeometry($$renderer, { radius: 0.3, args: [1.3, 1.3, 1.3] });
						$$renderer.push(`<!----> `);

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