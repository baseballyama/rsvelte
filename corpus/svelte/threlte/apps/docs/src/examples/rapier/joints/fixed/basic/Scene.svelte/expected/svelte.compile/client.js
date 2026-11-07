import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { OrbitControls, SoftShadows } from '@threlte/extras';
import { Collider, Debug, RigidBody } from '@threlte/rapier';
import Hammer from './Hammer.svelte';
import Tower from './Tower.svelte';

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	var fragment = root_2();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: [0, 7, 18],
			fov: 60,
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, { enableDamping: true, enableZoom: false, target: [0, 2.5, 0] });
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, {
			castShadow: true,
			intensity: 2,
			position: [8, 20, -3],
			'shadow.camera.top': -20,
			'shadow.camera.bottom': 20,
			'shadow.mapSize.width': 1024,
			'shadow.mapSize.height': 1024
		});
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, { intensity: 1 });
	});

	var node_3 = $.sibling(node_2, 2);

	SoftShadows(node_3, {});

	var node_4 = $.sibling(node_3, 2);

	{
		var consequent = ($$anchor) => {
			Debug($$anchor, {});
		};

		$.if(node_4, ($$render) => {
			if ($$props.debug) $$render(consequent);
		});
	}

	var node_5 = $.sibling(node_4, 2);

	$.key(node_5, () => $$props.resetKey, ($$anchor) => {
		var fragment_3 = root();
		var node_6 = $.first_child(fragment_3);

		Tower(node_6, { position: [-3, 0, 0], color: '#FE3D00' });

		var node_7 = $.sibling(node_6, 2);

		Tower(node_7, { position: [3, 0, 0], color: '#335086', jointed: true });

		var node_8 = $.sibling(node_7, 2);

		Hammer(node_8, {
			position: [-10, 3, 0],
			rotation: [0, 0, -Math.PI / 6],
			velocity: [15, 0, 0]
		});

		var node_9 = $.sibling(node_8, 2);

		Hammer(node_9, {
			position: [10, 3, 0],
			rotation: [0, 0, Math.PI / 6],
			velocity: [-15, 0, 0]
		});

		$.append($$anchor, fragment_3);
	});

	var node_10 = $.sibling(node_5, 2);

	$.component(node_10, () => T.Group, ($$anchor, T_Group) => {
		T_Group($$anchor, {
			position: [0, -0.5, 0],
			children: ($$anchor, $$slotProps) => {
				RigidBody($$anchor, {
					type: 'fixed',
					children: ($$anchor, $$slotProps) => {
						var fragment_5 = root_1();
						var node_11 = $.first_child(fragment_5);

						Collider(node_11, { shape: 'cuboid', args: [12, 0.5, 5] });

						var node_12 = $.sibling(node_11, 2);

						$.component(node_12, () => T.Mesh, ($$anchor, T_Mesh) => {
							T_Mesh($$anchor, {
								receiveShadow: true,
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = root_1();
									var node_13 = $.first_child(fragment_6);

									$.component(node_13, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
										T_BoxGeometry($$anchor, { args: [24, 1, 10] });
									});

									var node_14 = $.sibling(node_13, 2);

									$.component(node_14, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
										T_MeshStandardMaterial($$anchor, { color: '#888' });
									});

									$.append($$anchor, fragment_6);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_5);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}