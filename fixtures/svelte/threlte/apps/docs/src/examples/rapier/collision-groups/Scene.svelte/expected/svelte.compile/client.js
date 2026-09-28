import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { OrbitControls, Environment } from '@threlte/extras';
import { AutoColliders, CollisionGroups, RigidBody } from '@threlte/rapier';
import Ground from './Ground.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	let resetCounter = 0;

	const reset = () => {
		resetCounter += 1;
	};

	var $$exports = { reset };
	var fragment = root_2();
	var node = $.first_child(fragment);

	Environment(node, {
		url: '/textures/equirectangular/hdr/shanghai_riverside_1k.hdr'
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			'position.x': 12,
			'position.y': 13,
			fov: 40,
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, { enableDamping: true, enableZoom: false });
			},
			$$slots: { default: true }
		});
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { castShadow: true, position: [8, 20, -3] });
	});

	var node_3 = $.sibling(node_2, 2);

	$.key(node_3, () => resetCounter, ($$anchor) => {
		var fragment_2 = root_1();
		var node_4 = $.first_child(fragment_2);

		CollisionGroups(node_4, {
			memberships: [1],
			filter: [2],
			children: ($$anchor, $$slotProps) => {
				var fragment_3 = $.comment();
				var node_5 = $.first_child(fragment_3);

				$.component(node_5, () => T.Group, ($$anchor, T_Group) => {
					T_Group($$anchor, {
						position: [0, 1.5, 1 - Math.random() * 2],
						children: ($$anchor, $$slotProps) => {
							RigidBody($$anchor, {
								children: ($$anchor, $$slotProps) => {
									AutoColliders($$anchor, {
										shape: 'cuboid',
										children: ($$anchor, $$slotProps) => {
											var fragment_6 = $.comment();
											var node_6 = $.first_child(fragment_6);

											$.component(node_6, () => T.Mesh, ($$anchor, T_Mesh) => {
												T_Mesh($$anchor, {
													castShadow: true,
													children: ($$anchor, $$slotProps) => {
														var fragment_7 = root();
														var node_7 = $.first_child(fragment_7);

														$.component(node_7, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
															T_BoxGeometry($$anchor, {});
														});

														var node_8 = $.sibling(node_7, 2);

														$.component(node_8, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
															T_MeshStandardMaterial($$anchor, { color: 'red' });
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
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_3);
			},
			$$slots: { default: true }
		});

		var node_9 = $.sibling(node_4, 2);

		CollisionGroups(node_9, {
			memberships: [2],
			filter: [1, 3],
			children: ($$anchor, $$slotProps) => {
				var fragment_8 = $.comment();
				var node_10 = $.first_child(fragment_8);

				$.component(node_10, () => T.Group, ($$anchor, T_Group_1) => {
					T_Group_1($$anchor, {
						position: [0, 4.5, 1 - Math.random() * 2],
						children: ($$anchor, $$slotProps) => {
							RigidBody($$anchor, {
								children: ($$anchor, $$slotProps) => {
									AutoColliders($$anchor, {
										shape: 'cuboid',
										children: ($$anchor, $$slotProps) => {
											var fragment_11 = $.comment();
											var node_11 = $.first_child(fragment_11);

											$.component(node_11, () => T.Mesh, ($$anchor, T_Mesh_1) => {
												T_Mesh_1($$anchor, {
													castShadow: true,
													children: ($$anchor, $$slotProps) => {
														var fragment_12 = root();
														var node_12 = $.first_child(fragment_12);

														$.component(node_12, () => T.BoxGeometry, ($$anchor, T_BoxGeometry_1) => {
															T_BoxGeometry_1($$anchor, {});
														});

														var node_13 = $.sibling(node_12, 2);

														$.component(node_13, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
															T_MeshStandardMaterial_1($$anchor, { color: 'green' });
														});

														$.append($$anchor, fragment_12);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_11);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_8);
			},
			$$slots: { default: true }
		});

		var node_14 = $.sibling(node_9, 2);

		CollisionGroups(node_14, {
			memberships: [3],
			filter: [2],
			children: ($$anchor, $$slotProps) => {
				var fragment_13 = $.comment();
				var node_15 = $.first_child(fragment_13);

				$.component(node_15, () => T.Group, ($$anchor, T_Group_2) => {
					T_Group_2($$anchor, {
						position: [0, 3, 1 - Math.random() * 2],
						children: ($$anchor, $$slotProps) => {
							RigidBody($$anchor, {
								children: ($$anchor, $$slotProps) => {
									AutoColliders($$anchor, {
										shape: 'cuboid',
										children: ($$anchor, $$slotProps) => {
											var fragment_16 = $.comment();
											var node_16 = $.first_child(fragment_16);

											$.component(node_16, () => T.Mesh, ($$anchor, T_Mesh_2) => {
												T_Mesh_2($$anchor, {
													castShadow: true,
													children: ($$anchor, $$slotProps) => {
														var fragment_17 = root();
														var node_17 = $.first_child(fragment_17);

														$.component(node_17, () => T.BoxGeometry, ($$anchor, T_BoxGeometry_2) => {
															T_BoxGeometry_2($$anchor, {});
														});

														var node_18 = $.sibling(node_17, 2);

														$.component(node_18, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_2) => {
															T_MeshStandardMaterial_2($$anchor, { color: 'blue' });
														});

														$.append($$anchor, fragment_17);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_16);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_13);
			},
			$$slots: { default: true }
		});

		$.append($$anchor, fragment_2);
	});

	var node_19 = $.sibling(node_3, 2);

	$.component(node_19, () => T.GridHelper, ($$anchor, T_GridHelper) => {
		T_GridHelper($$anchor, { args: [50] });
	});

	var node_20 = $.sibling(node_19, 2);

	CollisionGroups(node_20, {
		groups: [1, 2, 3],
		children: ($$anchor, $$slotProps) => {
			Ground($$anchor, {});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);

	return $.pop($$exports);
}