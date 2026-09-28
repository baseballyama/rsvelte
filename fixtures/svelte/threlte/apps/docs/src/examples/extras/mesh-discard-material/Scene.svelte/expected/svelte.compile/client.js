import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { BakeShadows, MeshDiscardMaterial, OrbitControls } from '@threlte/extras';
import { MeshStandardMaterial, SphereGeometry } from 'three';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const geometry = new SphereGeometry();
	const material = new MeshStandardMaterial({ color: 'orangered' });
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: [5, 7, 5],
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, {});
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { position: [0, 5, 5], castShadow: true });
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			get geometry() {
				return geometry;
			},

			get material() {
				return material;
			},
			'position.x': -2,
			castShadow: true
		});
	});

	var node_3 = $.sibling(node_2, 2);

	$.component(node_3, () => T.Mesh, ($$anchor, T_Mesh_1) => {
		T_Mesh_1($$anchor, {
			get geometry() {
				return geometry;
			},

			get material() {
				return material;
			},
			castShadow: true,
			visible: false
		});
	});

	var node_4 = $.sibling(node_3, 2);

	$.component(node_4, () => T.Mesh, ($$anchor, T_Mesh_2) => {
		T_Mesh_2($$anchor, {
			get geometry() {
				return geometry;
			},
			position: 2,
			castShadow: true,
			children: ($$anchor, $$slotProps) => {
				MeshDiscardMaterial($$anchor, {});
			},
			$$slots: { default: true }
		});
	});

	var node_5 = $.sibling(node_4, 2);

	$.component(node_5, () => T.Mesh, ($$anchor, T_Mesh_3) => {
		T_Mesh_3($$anchor, {
			receiveShadow: true,
			'rotation.x': -1 * 0.5 * Math.PI,
			'position.y': -1 * 1.25,
			children: ($$anchor, $$slotProps) => {
				var fragment_3 = root();
				var node_6 = $.first_child(fragment_3);

				$.component(node_6, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
					T_MeshStandardMaterial($$anchor, {});
				});

				var node_7 = $.sibling(node_6, 2);

				$.component(node_7, () => T.CircleGeometry, ($$anchor, T_CircleGeometry) => {
					T_CircleGeometry($$anchor, { args: [5] });
				});

				$.append($$anchor, fragment_3);
			},
			$$slots: { default: true }
		});
	});

	var node_8 = $.sibling(node_5, 2);

	BakeShadows(node_8, {});
	$.append($$anchor, fragment);
	$.pop();
}