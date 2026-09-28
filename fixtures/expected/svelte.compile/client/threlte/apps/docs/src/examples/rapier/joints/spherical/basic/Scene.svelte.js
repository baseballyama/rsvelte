import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { OrbitControls, SoftShadows } from '@threlte/extras';
import { Collider, Debug, RigidBody } from '@threlte/rapier';
import Chain from './Chain.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	const tower = Array.from({ length: 4 }, (_, i) => i);
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: [0, 5, 12],
			fov: 55,
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

		Chain(node_6, {});

		var node_7 = $.sibling(node_6, 2);

		$.each(node_7, 17, () => tower, $.index, ($$anchor, i) => {
			var fragment_4 = $.comment();
			var node_8 = $.first_child(fragment_4);

			{
				let $0 = $.derived(() => [3, 0.5 + $.get(i), 0]);

				$.component(node_8, () => T.Group, ($$anchor, T_Group) => {
					T_Group($$anchor, {
						get position() {
							return $.get($0);
						},

						children: ($$anchor, $$slotProps) => {
							RigidBody($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = root();
									var node_9 = $.first_child(fragment_6);

									Collider(node_9, { shape: 'cuboid', args: [0.4, 0.4, 0.4] });

									var node_10 = $.sibling(node_9, 2);

									$.component(node_10, () => T.Mesh, ($$anchor, T_Mesh) => {
										T_Mesh($$anchor, {
											castShadow: true,
											children: ($$anchor, $$slotProps) => {
												var fragment_7 = root();
												var node_11 = $.first_child(fragment_7);

												$.component(node_11, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
													T_BoxGeometry($$anchor, { args: [0.8, 0.8, 0.8] });
												});

												var node_12 = $.sibling(node_11, 2);

												$.component(node_12, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
													T_MeshStandardMaterial($$anchor, { color: '#335086' });
												});

												$.append($$anchor, fragment_7);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_6);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				});
			}

			$.append($$anchor, fragment_4);
		});

		$.append($$anchor, fragment_3);
	});

	var node_13 = $.sibling(node_5, 2);

	$.component(node_13, () => T.Group, ($$anchor, T_Group_1) => {
		T_Group_1($$anchor, {
			position: [0, -0.5, 0],
			children: ($$anchor, $$slotProps) => {
				RigidBody($$anchor, {
					type: 'fixed',
					children: ($$anchor, $$slotProps) => {
						var fragment_9 = root();
						var node_14 = $.first_child(fragment_9);

						Collider(node_14, { shape: 'cuboid', args: [10, 0.5, 5] });

						var node_15 = $.sibling(node_14, 2);

						$.component(node_15, () => T.Mesh, ($$anchor, T_Mesh_1) => {
							T_Mesh_1($$anchor, {
								receiveShadow: true,
								children: ($$anchor, $$slotProps) => {
									var fragment_10 = root();
									var node_16 = $.first_child(fragment_10);

									$.component(node_16, () => T.BoxGeometry, ($$anchor, T_BoxGeometry_1) => {
										T_BoxGeometry_1($$anchor, { args: [20, 1, 10] });
									});

									var node_17 = $.sibling(node_16, 2);

									$.component(node_17, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
										T_MeshStandardMaterial_1($$anchor, { color: '#888' });
									});

									$.append($$anchor, fragment_10);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_9);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}