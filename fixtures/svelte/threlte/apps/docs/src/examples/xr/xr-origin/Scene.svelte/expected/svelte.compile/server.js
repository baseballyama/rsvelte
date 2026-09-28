import * as $ from 'svelte/internal/server';
import { T, useTask } from '@threlte/core';
import { OrbitControls, Text, interactivity } from '@threlte/extras';

import {
	Controller,
	Hand,
	XR,
	XROrigin,
	pointerControls,
	useHeadset,
	useTeleport
} from '@threlte/xr';

import { Group } from 'three';
import Pad from './Pad.svelte';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const pads = [
			{
				id: 'rose',
				label: 'Rose',
				color: '#fb7185',
				position: [-1.8, 0, -2.1]
			},

			{
				id: 'cyan',
				label: 'Cyan',
				color: '#22d3ee',
				position: [0, 0, -3.2]
			},

			{
				id: 'amber',
				label: 'Amber',
				color: '#f59e0b',
				position: [1.9, 0, -1.75]
			}
		];

		const teleport = useTeleport();
		const headset = useHeadset();
		const feetMarker = new Group();
		let activePadId = 'cyan';

		interactivity();
		pointerControls('left');
		pointerControls('right');

		useTask(() => {
			feetMarker.position.set(headset.position.x, 0.02, headset.position.z);
		});

		const goTo = (pad) => {
			activePadId = pad.id;
			teleport(pad.position);
		};

		{
			function fallback($$renderer) {
				if (T.PerspectiveCamera) {
					$$renderer.push('<!--[-->');

					T.PerspectiveCamera($$renderer, {
						makeDefault: true,
						position: [0.2, 2.1, 3.8],
						oncreate: (ref) => {
							ref.lookAt(0, 0.75, -1.6);
						},

						children: ($$renderer) => {
							OrbitControls($$renderer, { target: [0, 0.7, -1.6], enablePan: false });
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			XR($$renderer, {
				fallback,
				children: ($$renderer) => {
					if (T.Group) {
						$$renderer.push('<!--[-->');

						T.Group($$renderer, {
							position: [0.75, 0, 0.55],
							'rotation.y': Math.PI / 5,
							children: ($$renderer) => {
								if (T.Mesh) {
									$$renderer.push('<!--[-->');

									T.Mesh($$renderer, {
										'position.y': 0.01,
										'rotation.x': -Math.PI / 2,
										raycast: () => false,
										children: ($$renderer) => {
											if (T.RingGeometry) {
												$$renderer.push('<!--[-->');
												T.RingGeometry($$renderer, { args: [0.22, 0.27, 48] });
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (T.MeshStandardMaterial) {
												$$renderer.push('<!--[-->');

												T.MeshStandardMaterial($$renderer, {
													color: '#fde68a',
													emissive: '#f59e0b',
													emissiveIntensity: 0.25,
													side: 2
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

								Text($$renderer, {
									color: '#fde68a',
									fontSize: 0.085,
									anchorX: 'center',
									anchorY: 'bottom',
									position: [0, 0.16, 0],
									raycast: () => false,
									children: ($$renderer) => {
										$$renderer.push(`<!---->rotated rig parent`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								XROrigin($$renderer, {
									children: ($$renderer) => {
										Controller($$renderer, { left: true });
										$$renderer.push(`<!----> `);
										Controller($$renderer, { right: true });
										$$renderer.push(`<!----> `);
										Hand($$renderer, { left: true });
										$$renderer.push(`<!----> `);
										Hand($$renderer, { right: true });
										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				$$slots: { fallback: true, default: true }
			});
		}

		$$renderer.push(`<!----> `);

		T($$renderer, {
			is: feetMarker,
			children: ($$renderer) => {
				if (T.Mesh) {
					$$renderer.push('<!--[-->');

					T.Mesh($$renderer, {
						'rotation.x': -Math.PI / 2,
						raycast: () => false,
						children: ($$renderer) => {
							if (T.RingGeometry) {
								$$renderer.push('<!--[-->');
								T.RingGeometry($$renderer, { args: [0.09, 0.14, 48] });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (T.MeshStandardMaterial) {
								$$renderer.push('<!--[-->');

								T.MeshStandardMaterial($$renderer, {
									color: '#ecfeff',
									emissive: '#22d3ee',
									emissiveIntensity: 0.9,
									side: 2
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

				Text($$renderer, {
					color: '#cffafe',
					fontSize: 0.095,
					anchorX: 'center',
					anchorY: 'bottom',
					position: [0, 0.13, 0],
					raycast: () => false,
					children: ($$renderer) => {
						$$renderer.push(`<!---->feet`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, {
				receiveShadow: true,
				'rotation.x': -Math.PI / 2,
				children: ($$renderer) => {
					if (T.CircleGeometry) {
						$$renderer.push('<!--[-->');
						T.CircleGeometry($$renderer, { args: [8, 96] });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshStandardMaterial($$renderer, { color: '#0f172a' });
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

		if (T.GridHelper) {
			$$renderer.push('<!--[-->');
			T.GridHelper($$renderer, { args: [16, 16, '#1f2937', '#111827'], 'position.y': 0.001 });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` <!--[-->`);

		const each_array = $.ensure_array_like(pads);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let pad = each_array[$$index];

			Pad($$renderer, {
				active: activePadId === pad.id,
				color: pad.color,
				label: pad.label,
				position: pad.position,
				onclick: () => goTo(pad)
			});
		}

		$$renderer.push(`<!--]--> `);

		if (T.Group) {
			$$renderer.push('<!--[-->');

			T.Group($$renderer, {
				position: [0, 1.45, 1.2],
				children: ($$renderer) => {
					Text($$renderer, {
						color: '#e5e7eb',
						fontSize: 0.11,
						maxWidth: 3.3,
						anchorX: 'center',
						anchorY: 'middle',
						textAlign: 'center',
						raycast: () => false,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Walk around in room-scale, then click a pad. The cyan feet marker should land exactly on the
    selected target even though the XR origin lives inside a rotated parent rig.`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.AmbientLight) {
			$$renderer.push('<!--[-->');
			T.AmbientLight($$renderer, { intensity: 0.65 });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.DirectionalLight) {
			$$renderer.push('<!--[-->');

			T.DirectionalLight($$renderer, {
				castShadow: true,
				intensity: 1.8,
				position: [3, 5, 2],
				'shadow.mapSize.width': 1024,
				'shadow.mapSize.height': 1024,
				'shadow.camera.top': 6,
				'shadow.camera.right': 6,
				'shadow.camera.bottom': -6,
				'shadow.camera.left': -6
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}