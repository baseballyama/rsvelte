import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as THREE from 'three';
import { T } from '@threlte/core';
import { useGltf, useTexture, InstancedMesh, Instance } from '@threlte/extras';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Bush($$anchor, $$props) {
	$.push($$props, true);

	let transformData = $.prop($$props, 'transformData', 19, () => []);
	const gltf = useGltf('https://fun-bit.vercel.app/Ultimate-Stylized-Nature/Bush.gltf');
	const texture1 = useTexture('https://fun-bit.vercel.app/Ultimate-Stylized-Nature/Textures/Bush_Leaves.png');
	const assets = Promise.all([gltf, texture1]);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.await(node, () => assets, null, ($$anchor, $$source) => {
		var $$value = $.derived(() => {
			var [$gltf, $texture1] = $.get($$source);

			return { $gltf, $texture1 };
		});

		var $gltf = $.derived(() => $.get($$value).$gltf);
		var $texture1 = $.derived(() => $.get($$value).$texture1);

		InstancedMesh($$anchor, {
			castShadow: true,
			receiveShadow: true,
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root();
				var node_1 = $.first_child(fragment_2);

				T(node_1, {
					get is() {
						return $.get($gltf).nodes.Bush.geometry;
					}
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
					T_MeshStandardMaterial($$anchor, {
						get map() {
							return $.get($texture1);
						},
						alphaTest: 0.2
					});
				});

				var node_3 = $.sibling(node_2, 2);

				$.each(node_3, 17, transformData, $.index, ($$anchor, randomValues) => {
					const x = $.derived(() => $.get(randomValues)[0] * 20 - 10);
					const z = $.derived(() => $.get(randomValues)[1] * 20 - 10);
					const rot = $.derived(() => $.get(randomValues)[2] * Math.PI * 2);
					const scale = $.derived(() => $.get(randomValues)[3] * 2 + 0.5);
					var fragment_3 = $.comment();
					var node_4 = $.first_child(fragment_3);

					$.component(node_4, () => T.Group, ($$anchor, T_Group) => {
						T_Group($$anchor, {
							get 'position.x'() {
								return $.get(x);
							},

							get 'position.z'() {
								return $.get(z);
							},

							get 'rotation.y'() {
								return $.get(rot);
							},

							get scale() {
								return $.get(scale);
							},

							children: ($$anchor, $$slotProps) => {
								Instance($$anchor, { rotation: [1.96, -0.48, -0.85] });
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_3);
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}