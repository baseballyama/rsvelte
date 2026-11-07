import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { OrbitControls } from '@threlte/extras';
import { Collider, Debug, RigidBody } from '@threlte/rapier';
import Press from './Press.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	const cubes = [
		[-1.1, 1.0, -0.6],
		[-0.5, 1.0, 0.5],
		[0.2, 1.0, -0.3],
		[0.8, 1.0, 0.4],
		[1.2, 1.0, -0.5]
	];

	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: [5, 4, 10],
			fov: 50,
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, { enableDamping: true, enableZoom: false, target: [0, 2.5, 0] });
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { castShadow: true, position: [8, 20, -3] });
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, { intensity: 0.4 });
	});

	var node_3 = $.sibling(node_2, 2);

	{
		var consequent = ($$anchor) => {
			Debug($$anchor, {});
		};

		$.if(node_3, ($$render) => {
			if ($$props.debug) $$render(consequent);
		});
	}

	var node_4 = $.sibling(node_3, 2);

	$.key(node_4, () => $$props.resetKey, ($$anchor) => {
		var fragment_3 = root();
		var node_5 = $.first_child(fragment_3);

		Press(node_5, {});

		var node_6 = $.sibling(node_5, 2);

		$.each(node_6, 16, () => cubes, (pos) => pos, ($$anchor, pos) => {
			var fragment_4 = $.comment();
			var node_7 = $.first_child(fragment_4);

			$.component(node_7, () => T.Group, ($$anchor, T_Group) => {
				T_Group($$anchor, {
					get position() {
						return pos;
					},

					children: ($$anchor, $$slotProps) => {
						RigidBody($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_6 = root();
								var node_8 = $.first_child(fragment_6);

								Collider(node_8, {
									shape: 'cuboid',
									args: [0.15, 0.15, 0.15],
									density: 3,
									friction: 1.5
								});

								var node_9 = $.sibling(node_8, 2);

								$.component(node_9, () => T.Mesh, ($$anchor, T_Mesh) => {
									T_Mesh($$anchor, {
										castShadow: true,
										children: ($$anchor, $$slotProps) => {
											var fragment_7 = root();
											var node_10 = $.first_child(fragment_7);

											$.component(node_10, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
												T_BoxGeometry($$anchor, { args: [0.3, 0.3, 0.3] });
											});

											var node_11 = $.sibling(node_10, 2);

											$.component(node_11, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
												T_MeshStandardMaterial($$anchor, { color: '#FE3D00' });
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

			$.append($$anchor, fragment_4);
		});

		$.append($$anchor, fragment_3);
	});

	var node_12 = $.sibling(node_4, 2);

	$.component(node_12, () => T.Group, ($$anchor, T_Group_1) => {
		T_Group_1($$anchor, {
			position: [0, -0.5, 0],
			children: ($$anchor, $$slotProps) => {
				RigidBody($$anchor, {
					type: 'fixed',
					children: ($$anchor, $$slotProps) => {
						var fragment_9 = root();
						var node_13 = $.first_child(fragment_9);

						Collider(node_13, { shape: 'cuboid', args: [10, 0.5, 5] });

						var node_14 = $.sibling(node_13, 2);

						$.component(node_14, () => T.Mesh, ($$anchor, T_Mesh_1) => {
							T_Mesh_1($$anchor, {
								receiveShadow: true,
								children: ($$anchor, $$slotProps) => {
									var fragment_10 = root();
									var node_15 = $.first_child(fragment_10);

									$.component(node_15, () => T.BoxGeometry, ($$anchor, T_BoxGeometry_1) => {
										T_BoxGeometry_1($$anchor, { args: [20, 1, 10] });
									});

									var node_16 = $.sibling(node_15, 2);

									$.component(node_16, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
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