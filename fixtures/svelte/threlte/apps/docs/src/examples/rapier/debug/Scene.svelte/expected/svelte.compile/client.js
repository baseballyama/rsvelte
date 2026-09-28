import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { OrbitControls, SoftShadows } from '@threlte/extras';
import { Collider, RigidBody } from '@threlte/rapier';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	const stack = Array.from({ length: 4 }, (_, i) => i);
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: [10, 8, 10],
			fov: 45,
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, { enableDamping: true, enableZoom: false });
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	SoftShadows(node_1, {});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { castShadow: true, position: [3, 20, -3] });
	});

	var node_3 = $.sibling(node_2, 2);

	$.component(node_3, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, { intensity: 0.4 });
	});

	var node_4 = $.sibling(node_3, 2);

	$.each(node_4, 17, () => stack, $.index, ($$anchor, i) => {
		var fragment_2 = $.comment();
		var node_5 = $.first_child(fragment_2);

		$.each(node_5, 18, () => ['capsule', 'cuboid', 'ball'], (shape) => shape, ($$anchor, shape, j) => {
			var fragment_3 = $.comment();
			var node_6 = $.first_child(fragment_3);

			{
				let $0 = $.derived(() => [$.get(i) % 2 * 0.2 - 0.1, 1 + $.get(i) * $.get(j) * 1.05, 0]);

				$.component(node_6, () => T.Group, ($$anchor, T_Group) => {
					T_Group($$anchor, {
						get position() {
							return $.get($0);
						},

						children: ($$anchor, $$slotProps) => {
							RigidBody($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root();
									var node_7 = $.first_child(fragment_5);

									Collider(node_7, {
										get shape() {
											return shape;
										},
										args: [0.5, 0.5, 0.5],
										restitution: 0.2
									});

									var node_8 = $.sibling(node_7, 2);

									$.component(node_8, () => T.Mesh, ($$anchor, T_Mesh) => {
										T_Mesh($$anchor, {
											castShadow: true,
											receiveShadow: true,
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root();
												var node_9 = $.first_child(fragment_6);

												{
													var consequent = ($$anchor) => {
														var fragment_7 = $.comment();
														var node_10 = $.first_child(fragment_7);

														$.component(node_10, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
															T_BoxGeometry($$anchor, { args: [1, 1, 1] });
														});

														$.append($$anchor, fragment_7);
													};

													var consequent_1 = ($$anchor) => {
														var fragment_8 = $.comment();
														var node_11 = $.first_child(fragment_8);

														$.component(node_11, () => T.CapsuleGeometry, ($$anchor, T_CapsuleGeometry) => {
															T_CapsuleGeometry($$anchor, { args: [0.5, 1] });
														});

														$.append($$anchor, fragment_8);
													};

													var alternate = ($$anchor) => {
														var fragment_9 = $.comment();
														var node_12 = $.first_child(fragment_9);

														$.component(node_12, () => T.SphereGeometry, ($$anchor, T_SphereGeometry) => {
															T_SphereGeometry($$anchor, { args: [0.5] });
														});

														$.append($$anchor, fragment_9);
													};

													$.if(node_9, ($$render) => {
														if (shape === 'cuboid') $$render(consequent); else if (shape === 'capsule') $$render(consequent_1, 1); else $$render(alternate, -1);
													});
												}

												var node_13 = $.sibling(node_9, 2);

												{
													let $0 = $.derived(() => $$props.materials ? 1 : 0);

													$.component(node_13, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
														T_MeshStandardMaterial($$anchor, {
															color: 'orange',
															transparent: true,
															get opacity() {
																return $.get($0);
															}
														});
													});
												}

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
			}

			$.append($$anchor, fragment_3);
		});

		$.append($$anchor, fragment_2);
	});

	var node_14 = $.sibling(node_4, 2);

	$.component(node_14, () => T.Group, ($$anchor, T_Group_1) => {
		T_Group_1($$anchor, {
			position: [0, -0.5, 0],
			'rotation.x': Math.PI / 6,
			children: ($$anchor, $$slotProps) => {
				RigidBody($$anchor, {
					type: 'fixed',
					children: ($$anchor, $$slotProps) => {
						var fragment_11 = root();
						var node_15 = $.first_child(fragment_11);

						Collider(node_15, { shape: 'cuboid', args: [5, 0.5, 5] });

						var node_16 = $.sibling(node_15, 2);

						$.component(node_16, () => T.Mesh, ($$anchor, T_Mesh_1) => {
							T_Mesh_1($$anchor, {
								receiveShadow: true,
								children: ($$anchor, $$slotProps) => {
									var fragment_12 = root();
									var node_17 = $.first_child(fragment_12);

									$.component(node_17, () => T.BoxGeometry, ($$anchor, T_BoxGeometry_1) => {
										T_BoxGeometry_1($$anchor, { args: [10, 1, 10] });
									});

									var node_18 = $.sibling(node_17, 2);

									$.component(node_18, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
										T_MeshStandardMaterial_1($$anchor, { color: '#888' });
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
	});

	var node_19 = $.sibling(node_14, 2);

	$.component(node_19, () => T.Group, ($$anchor, T_Group_2) => {
		T_Group_2($$anchor, {
			position: [0, -8, 0],
			children: ($$anchor, $$slotProps) => {
				Collider($$anchor, {
					args: [15, 1, 15],
					sensor: true,
					shape: 'cuboid',
					onsensorenter: (event) => {
						const body = event.targetRigidBody;

						body?.setLinvel({ x: 0, y: 0, z: 0 }, true);
						body?.setAngvel({ x: 0, y: 0, z: 0 }, true);
						body?.setTranslation({ x: 0, y: 15, z: 0 }, true);
					}
				});
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}