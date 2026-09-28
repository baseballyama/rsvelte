import * as $ from 'svelte/internal/server';
import * as THREE from 'three';
import { T } from '@threlte/core';
import { useGltf, InstancedMesh, Instance } from '@threlte/extras';

export default function Rock($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { transformData = [] } = $$props;
		const gltf = useGltf('https://fun-bit.vercel.app/Ultimate-Stylized-Nature/Rock_2.gltf');

		if ($.store_get($$store_subs ??= {}, '$gltf', gltf)) {
			$$renderer.push('<!--[0-->');

			InstancedMesh($$renderer, {
				castShadow: true,
				receiveShadow: true,
				children: ($$renderer) => {
					T($$renderer, {
						is: $.store_get($$store_subs ??= {}, '$gltf', gltf).nodes.Rock_2.geometry
					});

					$$renderer.push(`<!----> `);

					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshStandardMaterial($$renderer, { color: 'grey' });
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
						const scale = randomValues[3] + 0.5;

						Instance($$renderer, { 'position.x': x, 'position.z': z, 'rotation.y': rot, scale });
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}