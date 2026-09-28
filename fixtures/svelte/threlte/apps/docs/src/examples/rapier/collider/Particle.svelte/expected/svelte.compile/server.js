import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { Collider, RigidBody } from '@threlte/rapier';
import { BoxGeometry, MeshStandardMaterial } from 'three';

const geometry = new BoxGeometry(0.25, 0.25, 0.25);
const material = new MeshStandardMaterial();

export default function Particle($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { position, quaternion } = $$props;

		if (T.Group) {
			$$renderer.push('<!--[-->');

			T.Group($$renderer, {
				position,
				quaternion,
				children: ($$renderer) => {
					RigidBody($$renderer, {
						type: 'dynamic',
						children: ($$renderer) => {
							Collider($$renderer, { shape: 'cuboid', args: [0.125, 0.125, 0.125] });
							$$renderer.push(`<!----> `);

							if (T.Mesh) {
								$$renderer.push('<!--[-->');
								T.Mesh($$renderer, { castShadow: true, receiveShadow: true, geometry, material });
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

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}