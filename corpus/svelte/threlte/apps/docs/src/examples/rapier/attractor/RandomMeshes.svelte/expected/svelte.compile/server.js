import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { Collider, RigidBody } from '@threlte/rapier';
import { MeshBasicMaterial, SphereGeometry, Vector3 } from 'three';

const geometry = new SphereGeometry(1);
const material = new MeshBasicMaterial({ color: 'red' });

export default function RandomMeshes($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			count = 20,
			rangeX = [-20, 20],
			rangeY = [-20, 20],
			rangeZ = [-20, 20]
		} = $$props;

		const min = new Vector3();
		const size = new Vector3();

		const createRandomPosition = () => {
			min.set(rangeX[0], rangeY[0], rangeZ[0]);
			size.set(rangeX[1], rangeY[1], rangeZ[1]).sub(min);

			return new Vector3().random().multiply(size).add(min).toArray();
		};

		const bodies = $.derived(() => Array.from({ length: count }, () => createRandomPosition()));

		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(bodies());

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let position = each_array[$$index];

			if (T.Group) {
				$$renderer.push('<!--[-->');

				T.Group($$renderer, {
					position,
					children: ($$renderer) => {
						RigidBody($$renderer, {
							children: ($$renderer) => {
								Collider($$renderer, { shape: 'ball', args: [0.75], mass: Math.random() * 10 });
								$$renderer.push(`<!----> `);

								if (T.Mesh) {
									$$renderer.push('<!--[-->');
									T.Mesh($$renderer, { geometry, material });
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
		}

		$$renderer.push(`<!--]-->`);
	});
}