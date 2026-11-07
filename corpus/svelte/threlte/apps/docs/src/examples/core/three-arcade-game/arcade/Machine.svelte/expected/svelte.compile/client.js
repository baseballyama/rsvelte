import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { useGltf, useTexture, useCursor } from '@threlte/extras';
import { MathUtils } from 'three';
import { Tween } from 'svelte/motion';
import { StickPosition, Button } from './types';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Machine($$anchor, $$props) {
	$.push($$props, true);

	let joystick = $.prop($$props, 'joystick', 19, () => StickPosition.Idle),
		button = $.prop($$props, 'button', 19, () => Button.Idle);

	const { onPointerEnter, onPointerLeave } = useCursor();

	const stickRotation = Tween.of(
		() => {
			if (joystick() == StickPosition.Left) {
				return -15 * MathUtils.DEG2RAD;
			} else if (joystick() == StickPosition.Right) {
				return 15 * MathUtils.DEG2RAD;
			}

			return 0;
		},
		{ duration: 100 }
	);

	const gltf = useGltf('/models/ball-game/archade-machine/arcade_machine_own.glb').then((gltf) => {
		Object.entries(gltf.materials).forEach(([name, material]) => {
			const n = name;

			if (n === 'joystick cap') material.envMapIntensity = 1; else if (n === 'joystick stick') material.envMapIntensity = 1; else material.envMapIntensity = 0.2;
		});

		return gltf;
	});

	const scanLinesTexture = useTexture('/models/ball-game/archade-machine/textures/scanlines.png');
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.await(node, () => gltf, null, ($$anchor, $$source) => {
		var $$value = $.derived(() => {
			var { nodes, materials } = $.get($$source);

			return { nodes, materials };
		});

		var nodes = $.derived(() => $.get($$value).nodes);
		var materials = $.derived(() => $.get($$value).materials);
		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		{
			let $0 = $.derived(() => MathUtils.DEG2RAD * 180);

			$.component(node_1, () => T.Group, ($$anchor, T_Group) => {
				T_Group($$anchor, {
					get 'rotation.y'() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => T.Mesh, ($$anchor, T_Mesh) => {
							T_Mesh($$anchor, {
								get geometry() {
									return $.get(nodes).BodyMesh.geometry;
								},

								get material() {
									return $.get(materials)['machine body main'];
								},
								position: [0.2755, 0, 0]
							});
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => T.Mesh, ($$anchor, T_Mesh_1) => {
							T_Mesh_1($$anchor, {
								get geometry() {
									return $.get(nodes).LeftCover.geometry;
								},

								get material() {
									return $.get(materials)['machine body outer'];
								},
								position: [0.3, 1.2099, -0.1307]
							});
						});

						var node_4 = $.sibling(node_3, 2);

						$.component(node_4, () => T.Mesh, ($$anchor, T_Mesh_2) => {
							T_Mesh_2($$anchor, {
								get geometry() {
									return $.get(nodes).RightCover.geometry;
								},

								get material() {
									return $.get(materials)['machine body outer'];
								},
								position: [-0.3, 1.2099, -0.1307],
								scale: [-1, 1, 1]
							});
						});

						var node_5 = $.sibling(node_4, 2);

						$.component(node_5, () => T.Mesh, ($$anchor, T_Mesh_3) => {
							T_Mesh_3($$anchor, {
								get geometry() {
									return $.get(nodes).ScreenFrame.geometry;
								},

								get material() {
									return $.get(materials)['screen frame'];
								},
								position: [0.2755, 0.0633, 0.0346]
							});
						});

						var node_6 = $.sibling(node_5, 2);

						$.component(node_6, () => T.Mesh, ($$anchor, T_Mesh_4) => {
							T_Mesh_4($$anchor, {
								get geometry() {
									return $.get(nodes).joystick_base.geometry;
								},

								get material() {
									return $.get(materials)['joystick base'];
								},
								position: [0.1336, 0.9611, -0.1976],
								rotation: [-0.1939, 0, 0]
							});
						});

						var node_7 = $.sibling(node_6, 2);

						{
							let $0 = $.derived(() => [-0.1939, 0, stickRotation.current]);

							$.component(node_7, () => T.Mesh, ($$anchor, T_Mesh_5) => {
								T_Mesh_5($$anchor, {
									get geometry() {
										return $.get(nodes).joystick_stick_application.geometry;
									},

									get material() {
										return $.get(materials)['joystick base'];
									},
									position: [0.1336, 0.9653, -0.1984],
									get rotation() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_8 = $.first_child(fragment_3);

										$.component(node_8, () => T.Mesh, ($$anchor, T_Mesh_6) => {
											T_Mesh_6($$anchor, {
												get geometry() {
													return $.get(nodes).joystick_stick.geometry;
												},

												get material() {
													return $.get(materials)['joystick stick'];
												},
												position: [0, -0.0145, 0.0001],
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = $.comment();
													var node_9 = $.first_child(fragment_4);

													$.component(node_9, () => T.Mesh, ($$anchor, T_Mesh_7) => {
														T_Mesh_7($$anchor, {
															get geometry() {
																return $.get(nodes).joystick_cap.geometry;
															},

															get material() {
																return $.get(materials)['joystick cap'];
															},
															position: [-0.0001, 0.1126, -0.0005],
															'material.envMapIntensity': 0.5
														});
													});

													$.append($$anchor, fragment_4);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});
						}

						var node_10 = $.sibling(node_7, 2);

						$.component(node_10, () => T.Mesh, ($$anchor, T_Mesh_8) => {
							T_Mesh_8($$anchor, {
								get geometry() {
									return $.get(nodes).Main_Button_Enclosure.geometry;
								},

								get material() {
									return $.get(materials)['joystick base'];
								},
								position: [-0.1143, 0.9795, -0.0933],
								rotation: [-0.1801, 0, 0],
								scale: 0.9409,
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = $.comment();
									var node_11 = $.first_child(fragment_5);

									{
										let $0 = $.derived(() => [
											0.0001,
											0.007 + (button() == Button.Pressed ? -0.003 : 0),
											-0.0003
										]);

										$.component(node_11, () => T.Mesh, ($$anchor, T_Mesh_9) => {
											T_Mesh_9($$anchor, {
												get geometry() {
													return $.get(nodes).Main_Button.geometry;
												},

												get material() {
													return $.get(materials)['joystick cap'];
												},

												get position() {
													return $.get($0);
												},
												rotation: [0.192, 0, 0],
												scale: 0.724
											});
										});
									}

									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});
						});

						var node_12 = $.sibling(node_10, 2);

						$.component(node_12, () => T.Mesh, ($$anchor, T_Mesh_10) => {
							T_Mesh_10($$anchor, {
								get geometry() {
									return $.get(nodes).Screen.geometry;
								},
								position: [0, 1.3774, 0.1447],
								scale: 1.0055,
								get onpointerenter() {
									return onPointerEnter;
								},

								get onpointerleave() {
									return onPointerLeave;
								},

								onclick: () => {
									$$props.screenClicked?.();
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_6 = $.comment();
									var node_13 = $.first_child(fragment_6);

									$.await(node_13, () => scanLinesTexture, null, ($$anchor, texture) => {
										var fragment_7 = $.comment();
										var node_14 = $.first_child(fragment_7);

										{
											var consequent = ($$anchor) => {
												var fragment_8 = $.comment();
												var node_15 = $.first_child(fragment_8);

												$.component(node_15, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
													T_MeshStandardMaterial($$anchor, {
														metalness: 0.9,
														roughness: 0.2,
														get map() {
															return $$props.screenTexture;
														},

														get metalnessMap() {
															return $.get(texture);
														}
													});
												});

												$.append($$anchor, fragment_8);
											};

											var alternate = ($$anchor) => {
												var fragment_9 = $.comment();
												var node_16 = $.first_child(fragment_9);

												$.component(node_16, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
													T_MeshStandardMaterial_1($$anchor, {
														metalness: 0.9,
														roughness: 0.2,
														color: '#141414',
														get metalnessMap() {
															return $.get(texture);
														}
													});
												});

												$.append($$anchor, fragment_9);
											};

											$.if(node_14, ($$render) => {
												if ($$props.screenTexture) $$render(consequent); else $$render(alternate, -1);
											});
										}

										$.append($$anchor, fragment_7);
									});

									$.append($$anchor, fragment_6);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});
		}

		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
	$.pop();
}