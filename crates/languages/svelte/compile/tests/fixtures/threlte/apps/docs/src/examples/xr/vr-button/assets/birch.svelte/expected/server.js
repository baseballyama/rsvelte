import * as $ from 'svelte/internal/server';
import { Mesh, MeshStandardMaterial, RepeatWrapping, DoubleSide } from 'three';
import { T } from '@threlte/core';
import { useGltf, useTexture, InstancedMesh, Instance } from '@threlte/extras';

export default function Birch($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { transformData = [] } = $$props;

		const assets = Promise.all([
			useGltf('https://fun-bit.vercel.app/Ultimate-Stylized-Nature/BirchTree_1.gltf'),
			useTexture('https://fun-bit.vercel.app/Ultimate-Stylized-Nature/Textures/BirchTree_Bark.png'),
			useTexture('https://fun-bit.vercel.app/Ultimate-Stylized-Nature/Textures/BirchTree_Leaves.png'),
			useTexture('https://fun-bit.vercel.app/Ultimate-Stylized-Nature/Textures/BirchTree_Bark_Normal.png')
		]);

		$.await($$renderer, assets, () => {}, ([$gltf, $texture1, $texture2, $normalMap1]) => {
			InstancedMesh($$renderer, {
				castShadow: true,
				children: ($$renderer) => {
					T($$renderer, { is: $gltf.nodes.Cube004.geometry });
					$$renderer.push(`<!----> `);

					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');

						T.MeshStandardMaterial($$renderer, {
							map: $texture1,
							'map.wrapS': RepeatWrapping,
							'map.wrapT': RepeatWrapping,
							normalMap: $normalMap1,
							'normalMap.wrapS': RepeatWrapping,
							'normalMap.wrapT': RepeatWrapping
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` <!--[-->`);

					const each_array = $.ensure_array_like(transformData);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let randomValues = each_array[$$index];
						const x = randomValues[0] * 20 - 10;
						const z = randomValues[1] * 20 - 10;
						const rot = randomValues[2] * Math.PI * 2;
						const scale = randomValues[3] * 2 + 1;

						Instance($$renderer, { 'position.x': x, 'position.z': z, 'rotation.y': rot, scale });
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			InstancedMesh($$renderer, {
				castShadow: true,
				children: ($$renderer) => {
					T($$renderer, { is: $gltf.nodes.Cube004_1.geometry });
					$$renderer.push(`<!----> `);

					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshStandardMaterial($$renderer, { map: $texture2, side: DoubleSide, alphaTest: 0.5 });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` <!--[-->`);

					const each_array_1 = $.ensure_array_like(transformData);

					for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
						let randomValues = each_array_1[$$index_1];
						const x = randomValues[0] * 20 - 10;
						const z = randomValues[1] * 20 - 10;
						const rot = randomValues[2] * Math.PI * 2;
						const scale = randomValues[3] * 2 + 1;

						Instance($$renderer, { 'position.x': x, 'position.z': z, 'rotation.y': rot, scale });
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		});

		$$renderer.push(`<!--]-->`);
	});
}