import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as THREE from 'three';
import { T } from '@threlte/core';
import { useGltf, useTexture, InstancedMesh, Instance } from '@threlte/extras';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Tree($$anchor, $$props) {
	$.push($$props, true);

	let transformData = $.prop($$props, 'transformData', 19, () => []);

	const assets = Promise.all([
		useGltf('https://fun-bit.vercel.app/Ultimate-Stylized-Nature/NormalTree_1.gltf'),
		useTexture('https://fun-bit.vercel.app/Ultimate-Stylized-Nature/Textures/NormalTree_Bark.png'),
		useTexture('https://fun-bit.vercel.app/Ultimate-Stylized-Nature/Textures/NormalTree_Leaves.png'),
		useTexture('https://fun-bit.vercel.app/Ultimate-Stylized-Nature/Textures/NormalTree_Bark_Normal.png')
	]);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.await(node, () => assets, null, ($$anchor, $$source) => {
		var $$value = $.derived(() => {
			var [$gltf, $texture1, $texture2, $normalMap1] = $.get($$source);

			return { $gltf, $texture1, $texture2, $normalMap1 };
		});

		var $gltf = $.derived(() => $.get($$value).$gltf);
		var $texture1 = $.derived(() => $.get($$value).$texture1);
		var $texture2 = $.derived(() => $.get($$value).$texture2);
		var $normalMap1 = $.derived(() => $.get($$value).$normalMap1);
		var fragment_1 = root_1();
		var node_1 = $.first_child(fragment_1);

		InstancedMesh(node_1, {
			castShadow: true,
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root();
				var node_2 = $.first_child(fragment_2);

				T(node_2, {
					get is() {
						return $.get($gltf).nodes.Cylinder001.geometry;
					}
				});

				var node_3 = $.sibling(node_2, 2);

				$.component(node_3, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
					T_MeshStandardMaterial($$anchor, {
						get map() {
							return $.get($texture1);
						},

						get 'map.wrapS'() {
							return THREE.RepeatWrapping;
						},

						get 'map.wrapT'() {
							return THREE.RepeatWrapping;
						},

						get normalMap() {
							return $.get($normalMap1);
						},

						get 'normalMap.wrapS'() {
							return THREE.RepeatWrapping;
						},

						get 'normalMap.wrapT'() {
							return THREE.RepeatWrapping;
						}
					});
				});

				var node_4 = $.sibling(node_3, 2);

				$.each(node_4, 17, transformData, $.index, ($$anchor, randomValues) => {
					const x = $.derived(() => $.get(randomValues)[0] * 20 - 10);
					const z = $.derived(() => $.get(randomValues)[1] * 20 - 10);
					const rot = $.derived(() => $.get(randomValues)[2] * Math.PI * 2);
					const scale = $.derived(() => $.get(randomValues)[3] * 2 + 1);

					Instance($$anchor, {
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
						}
					});
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});

		var node_5 = $.sibling(node_1, 2);

		InstancedMesh(node_5, {
			castShadow: true,
			children: ($$anchor, $$slotProps) => {
				var fragment_4 = root();
				var node_6 = $.first_child(fragment_4);

				T(node_6, {
					get is() {
						return $.get($gltf).nodes.Cylinder001_1.geometry;
					}
				});

				var node_7 = $.sibling(node_6, 2);

				$.component(node_7, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
					T_MeshStandardMaterial_1($$anchor, {
						get map() {
							return $.get($texture2);
						},

						get side() {
							return THREE.DoubleSide;
						},
						alphaTest: 0.5
					});
				});

				var node_8 = $.sibling(node_7, 2);

				$.each(node_8, 17, transformData, $.index, ($$anchor, randomValues) => {
					const x = $.derived(() => $.get(randomValues)[0] * 20 - 10);
					const z = $.derived(() => $.get(randomValues)[1] * 20 - 10);
					const rot = $.derived(() => $.get(randomValues)[2] * Math.PI * 2);
					const scale = $.derived(() => $.get(randomValues)[3] * 2 + 1);

					Instance($$anchor, {
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
						}
					});
				});

				$.append($$anchor, fragment_4);
			},
			$$slots: { default: true }
		});

		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
	$.pop();
}