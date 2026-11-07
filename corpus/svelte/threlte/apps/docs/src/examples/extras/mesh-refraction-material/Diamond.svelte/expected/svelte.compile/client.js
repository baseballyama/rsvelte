import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Mesh } from 'three';
import { T, useLoader } from '@threlte/core';
import { useGltf, MeshRefractionMaterial, useDraco } from '@threlte/extras';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Diamond($$anchor, $$props) {
	$.push($$props, true);

	let props = $.rest_props($$props, rest_excludes);
	const dracoLoader = useDraco();
	const gltf = useGltf('/models/diamond/dflat.glb', { dracoLoader });
	const env = useLoader(RGBELoader).load('/textures/equirectangular/hdr/aerodynamics_workshop_1k.hdr');
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.await(node, () => gltf, null, ($$anchor, $$source) => {
		var $$value = $.derived(() => {
			var { nodes } = $.get($$source);

			return { nodes };
		});

		var nodes = $.derived(() => $.get($$value).nodes);
		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		$.component(node_1, () => T.Mesh, ($$anchor, T_Mesh) => {
			T_Mesh($$anchor, $.spread_props(
				{
					castShadow: true,
					receiveShadow: true,
					get geometry() {
						return $.get(nodes).Diamond_1_0.geometry;
					}
				},
				() => props,
				{
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						$.await(node_2, () => env, null, ($$anchor, e) => {
							MeshRefractionMaterial($$anchor, {
								get envMap() {
									return $.get(e);
								},
								fresnel: 0.5,
								ior: 2.75,
								aberrationStrength: 0.04,
								bounces: 3,
								color: '#ffdddd'
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				}
			));
		});

		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
	$.pop();
}