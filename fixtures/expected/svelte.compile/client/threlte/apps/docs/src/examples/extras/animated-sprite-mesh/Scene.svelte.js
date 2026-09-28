import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { Grid, OrbitControls, Sky, AnimatedSpriteMaterial } from '@threlte/extras';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => T.OrthographicCamera, ($$anchor, T_OrthographicCamera) => {
		T_OrthographicCamera($$anchor, {
			makeDefault: true,
			near: -100,
			far: 100,
			zoom: 150,
			position: [5, 1.5, 3],
			oncreate: (ref) => ref.lookAt(0, 0, 0),
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, {
					enableDamping: true,
					enablePan: false,
					enableZoom: false,
					maxPolarAngle: Math.PI / 2.5,
					minPolarAngle: Math.PI / 6
				});
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	Sky(node_1, {});

	var node_2 = $.sibling(node_1, 2);

	Grid(node_2, {
		'position.y': 0.001,
		type: 'polar',
		fadeDistance: 10,
		infiniteGrid: true
	});

	var node_3 = $.sibling(node_2, 2);

	$.component(node_3, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			'position.y': 1,
			'position.x': -2,
			castShadow: true,
			receiveShadow: true,
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root();
				var node_4 = $.first_child(fragment_2);

				$.component(node_4, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
					T_MeshStandardMaterial($$anchor, { color: 'white' });
				});

				var node_5 = $.sibling(node_4, 2);

				$.component(node_5, () => T.SphereGeometry, ($$anchor, T_SphereGeometry) => {
					T_SphereGeometry($$anchor, {});
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});
	});

	var node_6 = $.sibling(node_3, 2);

	$.component(node_6, () => T.Mesh, ($$anchor, T_Mesh_1) => {
		T_Mesh_1($$anchor, {
			receiveShadow: true,
			'rotation.x': -Math.PI / 2,
			children: ($$anchor, $$slotProps) => {
				var fragment_3 = root();
				var node_7 = $.first_child(fragment_3);

				$.component(node_7, () => T.PlaneGeometry, ($$anchor, T_PlaneGeometry) => {
					T_PlaneGeometry($$anchor, { args: [1000, 1000] });
				});

				var node_8 = $.sibling(node_7, 2);

				$.component(node_8, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
					T_MeshStandardMaterial_1($$anchor, {});
				});

				$.append($$anchor, fragment_3);
			},
			$$slots: { default: true }
		});
	});

	var node_9 = $.sibling(node_6, 2);

	$.component(node_9, () => T.Mesh, ($$anchor, T_Mesh_2) => {
		T_Mesh_2($$anchor, {
			'position.y': 0.5,
			'rotation.y': Math.PI / 2,
			castShadow: true,
			receiveShadow: true,
			children: ($$anchor, $$slotProps) => {
				var fragment_4 = root();
				var node_10 = $.first_child(fragment_4);

				AnimatedSpriteMaterial(node_10, {
					animation: 'Idle_Left',
					textureUrl: '/textures/sprites/punk.png',
					dataUrl: '/textures/sprites/punk.json'
				});

				var node_11 = $.sibling(node_10, 2);

				$.component(node_11, () => T.PlaneGeometry, ($$anchor, T_PlaneGeometry_1) => {
					T_PlaneGeometry_1($$anchor, {});
				});

				$.append($$anchor, fragment_4);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}