import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { InstancedMesh, Instance } from '@threlte/extras';
import { Collider, RigidBody } from '@threlte/rapier';

export default function Cube($$renderer) {
	const size = 0.02;
	const limit = 100;

	if (T.Group) {
		$$renderer.push('<!--[-->');

		T.Group($$renderer, {
			position: [0, 1.7, 0],
			children: ($$renderer) => {
				InstancedMesh($$renderer, {
					limit,
					children: ($$renderer) => {
						if (T.BoxGeometry) {
							$$renderer.push('<!--[-->');
							T.BoxGeometry($$renderer, { args: [size, size, size] });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (T.MeshStandardMaterial) {
							$$renderer.push('<!--[-->');
							T.MeshStandardMaterial($$renderer, { roughness: 0, metalness: 0.2 });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` <!--[-->`);

						const each_array = $.ensure_array_like({ length: limit });

						for (let index = 0, $$length = each_array.length; index < $$length; index++) {
							let _ = each_array[index];

							RigidBody($$renderer, {
								children: ($$renderer) => {
									Collider($$renderer, { shape: 'cuboid', args: [size / 2, size / 2, size / 2] });
									$$renderer.push(`<!----> `);
									Instance($$renderer, { color: 'hotpink' });
									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]-->`);
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