import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Environment, OrbitControls } from '@threlte/extras';
import { EquirectangularReflectionMapping } from 'three';
import { RGBELoader } from 'three/examples/jsm/Addons.js';
import { T, useLoader } from '@threlte/core';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const { load } = useLoader(RGBELoader);

	const map = load('/textures/equirectangular/hdr/industrial_sunset_puresky_1k.hdr', {
		transform(texture) {
			texture.mapping = EquirectangularReflectionMapping;

			return texture;
		}
	});

	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			'position.z': 5,
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, { enableDamping: true, enableZoom: false });
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root();
				var node_2 = $.first_child(fragment_2);

				$.component(node_2, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
					T_MeshStandardMaterial($$anchor, { metalness: 1, roughness: 0 });
				});

				var node_3 = $.sibling(node_2, 2);

				$.component(node_3, () => T.SphereGeometry, ($$anchor, T_SphereGeometry) => {
					T_SphereGeometry($$anchor, {});
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});
	});

	var node_4 = $.sibling(node_1, 2);

	$.await(node_4, () => map, null, ($$anchor, texture) => {
		Environment($$anchor, {
			isBackground: true,
			get texture() {
				return $.get(texture);
			}
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}