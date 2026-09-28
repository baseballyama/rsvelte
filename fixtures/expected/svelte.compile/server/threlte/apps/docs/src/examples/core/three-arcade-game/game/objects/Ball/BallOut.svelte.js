import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { BoxGeometry, MeshBasicMaterial, Mesh, MathUtils, Group } from 'three';
import { useTimeout } from '../../hooks/useTimeout.svelte';
import { game } from '../../Game.svelte';

export default function BallOut($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const geometry = new BoxGeometry(1, 0.01, 0.1);
		const material = new MeshBasicMaterial({ color: 'red' });
		const { timeout } = useTimeout();
		let noBlink = false;

		timeout(
			() => {
				noBlink = true;
			},
			1e3
		);

		if (T.Group) {
			$$renderer.push('<!--[-->');

			T.Group($$renderer, {
				visible: !game.blinkClock || noBlink,
				'position.z': game.ballPosition.z,
				'position.x': game.ballPosition.x,
				'rotation.y': MathUtils.degToRad(45),
				children: ($$renderer) => {
					if (T.Mesh) {
						$$renderer.push('<!--[-->');

						T.Mesh($$renderer, {
							children: ($$renderer) => {
								T($$renderer, { is: geometry });
								$$renderer.push(`<!----> `);
								T($$renderer, { is: material });
								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.Mesh) {
						$$renderer.push('<!--[-->');

						T.Mesh($$renderer, {
							'rotation.y': MathUtils.degToRad(90),
							children: ($$renderer) => {
								T($$renderer, { is: geometry });
								$$renderer.push(`<!----> `);
								T($$renderer, { is: material });
								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
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