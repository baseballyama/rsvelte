import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { useGltf, useTexture, useCursor } from '@threlte/extras';
import { MathUtils } from 'three';
import { Tween } from 'svelte/motion';
import { StickPosition, Button } from './types';

export default function Machine($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			joystick = StickPosition.Idle,
			button = Button.Idle,
			screenTexture,
			screenClicked
		} = $$props;

		const { onPointerEnter, onPointerLeave } = useCursor();

		const stickRotation = Tween.of(
			() => {
				if (joystick == StickPosition.Left) {
					return -15 * MathUtils.DEG2RAD;
				} else if (joystick == StickPosition.Right) {
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

		$.await($$renderer, gltf, () => {}, ({ nodes, materials }) => {
			if (T.Group) {
				$$renderer.push('<!--[-->');

				T.Group($$renderer, {
					'rotation.y': MathUtils.DEG2RAD * 180,
					children: ($$renderer) => {
						if (T.Mesh) {
							$$renderer.push('<!--[-->');

							T.Mesh($$renderer, {
								geometry: nodes.BodyMesh.geometry,
								material: materials['machine body main'],
								position: [0.2755, 0, 0]
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (T.Mesh) {
							$$renderer.push('<!--[-->');

							T.Mesh($$renderer, {
								geometry: nodes.LeftCover.geometry,
								material: materials['machine body outer'],
								position: [0.3, 1.2099, -0.1307]
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (T.Mesh) {
							$$renderer.push('<!--[-->');

							T.Mesh($$renderer, {
								geometry: nodes.RightCover.geometry,
								material: materials['machine body outer'],
								position: [-0.3, 1.2099, -0.1307],
								scale: [-1, 1, 1]
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (T.Mesh) {
							$$renderer.push('<!--[-->');

							T.Mesh($$renderer, {
								geometry: nodes.ScreenFrame.geometry,
								material: materials['screen frame'],
								position: [0.2755, 0.0633, 0.0346]
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (T.Mesh) {
							$$renderer.push('<!--[-->');

							T.Mesh($$renderer, {
								geometry: nodes.joystick_base.geometry,
								material: materials['joystick base'],
								position: [0.1336, 0.9611, -0.1976],
								rotation: [-0.1939, 0, 0]
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (T.Mesh) {
							$$renderer.push('<!--[-->');

							T.Mesh($$renderer, {
								geometry: nodes.joystick_stick_application.geometry,
								material: materials['joystick base'],
								position: [0.1336, 0.9653, -0.1984],
								rotation: [-0.1939, 0, stickRotation.current],
								children: ($$renderer) => {
									if (T.Mesh) {
										$$renderer.push('<!--[-->');

										T.Mesh($$renderer, {
											geometry: nodes.joystick_stick.geometry,
											material: materials['joystick stick'],
											position: [0, -0.0145, 0.0001],
											children: ($$renderer) => {
												if (T.Mesh) {
													$$renderer.push('<!--[-->');

													T.Mesh($$renderer, {
														geometry: nodes.joystick_cap.geometry,
														material: materials['joystick cap'],
														position: [-0.0001, 0.1126, -0.0005],
														'material.envMapIntensity': 0.5
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (T.Mesh) {
							$$renderer.push('<!--[-->');

							T.Mesh($$renderer, {
								geometry: nodes.Main_Button_Enclosure.geometry,
								material: materials['joystick base'],
								position: [-0.1143, 0.9795, -0.0933],
								rotation: [-0.1801, 0, 0],
								scale: 0.9409,
								children: ($$renderer) => {
									if (T.Mesh) {
										$$renderer.push('<!--[-->');

										T.Mesh($$renderer, {
											geometry: nodes.Main_Button.geometry,
											material: materials['joystick cap'],
											position: [
												0.0001,
												0.007 + (button == Button.Pressed ? -0.003 : 0),
												-0.0003
											],
											rotation: [0.192, 0, 0],
											scale: 0.724
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (T.Mesh) {
							$$renderer.push('<!--[-->');

							T.Mesh($$renderer, {
								geometry: nodes.Screen.geometry,
								position: [0, 1.3774, 0.1447],
								scale: 1.0055,
								onpointerenter: onPointerEnter,
								onpointerleave: onPointerLeave,
								onclick: () => {
									screenClicked?.();
								},

								children: ($$renderer) => {
									$.await($$renderer, scanLinesTexture, () => {}, (texture) => {
										if (screenTexture) {
											$$renderer.push('<!--[0-->');

											if (T.MeshStandardMaterial) {
												$$renderer.push('<!--[-->');

												T.MeshStandardMaterial($$renderer, {
													metalness: 0.9,
													roughness: 0.2,
													map: screenTexture,
													metalnessMap: texture
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										} else {
											$$renderer.push('<!--[-1-->');

											if (T.MeshStandardMaterial) {
												$$renderer.push('<!--[-->');

												T.MeshStandardMaterial($$renderer, {
													metalness: 0.9,
													roughness: 0.2,
													color: '#141414',
													metalnessMap: texture
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										}

										$$renderer.push(`<!--]-->`);
									});

									$$renderer.push(`<!--]-->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		});

		$$renderer.push(`<!--]-->`);
	});
}