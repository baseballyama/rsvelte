import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as THREE from 'three';
import { T } from '@threlte/core';
import { useGltf, InstancedMesh, Instance } from '@threlte/extras';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Rock($$anchor, $$props) {
	$.push($$props, true);

	const $gltf = () => $.store_get(gltf, '$gltf', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let transformData = $.prop($$props, 'transformData', 19, () => []);
	const gltf = useGltf('https://fun-bit.vercel.app/Ultimate-Stylized-Nature/Rock_2.gltf');
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			InstancedMesh($$anchor, {
				castShadow: true,
				receiveShadow: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					T(node_1, {
						get is() {
							return $gltf().nodes.Rock_2.geometry;
						}
					});

					var node_2 = $.sibling(node_1, 2);

					$.component(node_2, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
						T_MeshStandardMaterial($$anchor, { color: 'grey' });
					});

					var node_3 = $.sibling(node_2, 2);

					$.each(node_3, 17, transformData, $.index, ($$anchor, randomValues) => {
						const x = $.derived(() => $.get(randomValues)[0] - 10);
						const z = $.derived(() => $.get(randomValues)[1] - 10);
						const rot = $.derived(() => $.get(randomValues)[2] * Math.PI * 2);
						const scale = $.derived(() => $.get(randomValues)[3] * 4 + 2);

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
		};

		$.if(node, ($$render) => {
			if ($gltf()) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}