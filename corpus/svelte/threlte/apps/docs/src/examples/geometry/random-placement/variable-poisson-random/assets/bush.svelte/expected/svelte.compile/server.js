import * as $ from 'svelte/internal/server';
import * as THREE from 'three';
import { T } from '@threlte/core';
import { useGltf, useTexture, InstancedMesh, Instance } from '@threlte/extras';

export default function Bush($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { transformData = [] } = $$props;

		const assets = Promise.all([
			useGltf('https://fun-bit.vercel.app/Ultimate-Stylized-Nature/Bush.gltf'),
			useTexture('https://fun-bit.vercel.app/Ultimate-Stylized-Nature/Textures/Bush_Leaves.png')
		]);

		$.await($$renderer, assets, () => {}, ([$gltf, $texture1]) => {
			InstancedMesh($$renderer, {
				castShadow: true,
				receiveShadow: true,
				children: ($$renderer) => {
					T($$renderer, { is: $gltf.nodes.Bush.geometry });
					$$renderer.push(`<!----> `);

					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshStandardMaterial($$renderer, { map: $texture1, alphaTest: 0.2 });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` <!--[-->`);

					const each_array = $.ensure_array_like(transformData);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let randomValues = each_array[$$index];
						const x = randomValues[0] - 10;
						const z = randomValues[1] - 10;
						const rot = randomValues[2] * Math.PI * 2;
						const scale = randomValues[3] * 2 + 0.5;

						if (T.Group) {
							$$renderer.push('<!--[-->');

							T.Group($$renderer, {
								'position.x': x,
								'position.z': z,
								'rotation.y': rot,
								scale,
								children: ($$renderer) => {
									Instance($$renderer, { rotation: [1.96, -0.48, -0.85] });
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
				},
				$$slots: { default: true }
			});
		});

		$$renderer.push(`<!--]-->`);
	});
}