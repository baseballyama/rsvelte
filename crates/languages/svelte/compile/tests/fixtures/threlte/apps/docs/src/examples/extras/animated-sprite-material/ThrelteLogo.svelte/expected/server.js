import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { AnimatedSpriteMaterial } from '@threlte/extras';

export default function ThrelteLogo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { show } = $$props;
		let animation = 'Hidden';
		let mounted = false;

		if (T.Sprite) {
			$$renderer.push('<!--[-->');

			T.Sprite($$renderer, {
				scale: [3.5, 1.75, 3.5],
				'position.y': 0.2,
				children: ($$renderer) => {
					AnimatedSpriteMaterial($$renderer, {
						textureUrl: '/textures/sprites/Threlte_7.png',
						dataUrl: '/textures/sprites/Threlte_7.json',
						animation,
						autoplay: true,
						loop: false
					});
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