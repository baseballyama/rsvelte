import * as $ from 'svelte/internal/server';
import { T, useTask } from '@threlte/core';
import { AnimatedSpriteMaterial, Suspense } from '@threlte/extras';
import { Mesh, MeshStandardMaterial } from 'three';

export default function Player($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { position = void 0 } = $$props;
		const keyboard = { x: 0 };
		const pressed = new Set();
		let sprite = void 0;
		let animation = 'IdleRight';
		const mesh = new Mesh();

		mesh.position.set(...position);

		const handleKey = (key, value) => {
			switch (key.toLowerCase()) {
				case 'a':

				case 'arrowleft':
					return keyboard.x = +value;

				case 'd':

				case 'arrowright':
					return keyboard.x = -value;
			}

			return;
		};

		const handleKeydown = (e) => {
			pressed.add(e.key);
			pressed.forEach((key) => handleKey(key, 1));
		};

		const handleKeyup = (e) => {
			pressed.delete(e.key);
			handleKey(e.key, 0);
			pressed.forEach((key) => handleKey(key, 1));

			if (e.key === 'q') sprite?.play();
			if (e.key === 'e') sprite?.pause();
		};

		useTask((delta) => {
			if (keyboard.x > 0) {
				animation = 'RunLeft';
			} else if (keyboard.x < 0) {
				animation = 'RunRight';
			} else {
				animation = animation.replace('Run', 'Idle');
			}

			if (keyboard.x === 0) return;

			position[0] += -keyboard.x * (delta * 2);
			mesh.position.set(...position);
		});

		Suspense($$renderer, {
			children: ($$renderer) => {
				T($$renderer, {
					is: mesh,
					children: ($$renderer) => {
						AnimatedSpriteMaterial($$renderer, {
							is: new MeshStandardMaterial(),
							animation,
							textureUrl: '/textures/sprites/player.png',
							dataUrl: '/textures/sprites/player.json'
						});

						$$renderer.push(`<!----> `);

						if (T.PlaneGeometry) {
							$$renderer.push('<!--[-->');
							T.PlaneGeometry($$renderer, { args: [0.5, 0.5] });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$.bind_props($$props, { position });
	});
}