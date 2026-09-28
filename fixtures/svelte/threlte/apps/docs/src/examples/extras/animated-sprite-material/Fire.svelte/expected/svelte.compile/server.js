import * as $ from 'svelte/internal/server';
import { T, useTask } from '@threlte/core';
import { AnimatedSpriteMaterial } from '@threlte/extras';
import { PointLight } from 'three';

export default function Fire($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const light = new PointLight('#FF893D', 100);
		let rate = 1 / 10;
		let fixedStepTimeAccumulator = 0;

		useTask((delta) => {
			fixedStepTimeAccumulator += delta;

			while (fixedStepTimeAccumulator >= rate) {
				fixedStepTimeAccumulator -= rate;

				// random light intensity between 22 and 44
				light.intensity = Math.random() * 24 + 22;
			}
		});

		if (T.Sprite) {
			$$renderer.push('<!--[-->');

			T.Sprite($$renderer, {
				'position.y': -2.3,
				children: ($$renderer) => {
					AnimatedSpriteMaterial($$renderer, {
						textureUrl: '/textures/sprites/fire.png',
						totalFrames: 8,
						fps: 10
					});

					$$renderer.push(`<!----> `);

					T($$renderer, {
						is: light,
						distance: 1.8,
						decay: 0.5,
						'position.y': -0.2,
						'position.z': 0.02
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}