import * as $ from 'svelte/internal/server';
import { T, useTask } from '@threlte/core';
import { Edges } from '@threlte/extras';
import { BoxGeometry, MeshBasicMaterial, MathUtils } from 'three';
import { game } from '../Game.svelte';

export default function ThrelteLogo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { scale = 1, positionZ = 0, direction = 1 } = $$props;
		const geometry = new BoxGeometry(1, 1, 1);
		const material = new MeshBasicMaterial({ transparent: true, opacity: 0 });
		let rotationY = 0;

		useTask((delta) => {
			rotationY += delta * direction;
		});

		if (T.Group) {
			$$renderer.push('<!--[-->');

			T.Group($$renderer, {
				'rotation.x': -65 * MathUtils.DEG2RAD,
				'rotation.y': rotationY,
				'position.z': positionZ,
				scale,
				children: ($$renderer) => {
					if (T.Mesh) {
						$$renderer.push('<!--[-->');

						T.Mesh($$renderer, {
							children: ($$renderer) => {
								T($$renderer, { is: geometry });
								$$renderer.push(`<!----> `);
								T($$renderer, { is: material });
								$$renderer.push(`<!----> `);
								Edges($$renderer, { color: game.baseColor });
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
							'position.x': 1,
							children: ($$renderer) => {
								T($$renderer, { is: geometry });
								$$renderer.push(`<!----> `);
								T($$renderer, { is: material });
								$$renderer.push(`<!----> `);
								Edges($$renderer, { color: game.baseColor });
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
							'position.x': -1,
							children: ($$renderer) => {
								T($$renderer, { is: geometry });
								$$renderer.push(`<!----> `);
								T($$renderer, { is: material });
								$$renderer.push(`<!----> `);
								Edges($$renderer, { color: game.baseColor });
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
							'position.z': 1,
							children: ($$renderer) => {
								T($$renderer, { is: geometry });
								$$renderer.push(`<!----> `);
								T($$renderer, { is: material });
								$$renderer.push(`<!----> `);
								Edges($$renderer, { color: game.baseColor });
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
							'position.z': -1,
							children: ($$renderer) => {
								T($$renderer, { is: geometry });
								$$renderer.push(`<!----> `);
								T($$renderer, { is: material });
								$$renderer.push(`<!----> `);
								Edges($$renderer, { color: game.baseColor });
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
							'position.y': 1,
							children: ($$renderer) => {
								T($$renderer, { is: geometry });
								$$renderer.push(`<!----> `);
								T($$renderer, { is: material });
								$$renderer.push(`<!----> `);
								Edges($$renderer, { color: game.baseColor });
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