import * as $ from 'svelte/internal/server';
import { T, useTask } from '@threlte/core';
import { Edges, PositionalAudio, useAudioListener, useCursor, useGltf } from '@threlte/extras';
import { Spring, Tween } from 'svelte/motion';

import {
	DoubleSide,
	Mesh,
	PositionalAudio as ThreePositionalAudio,
	MathUtils
} from 'three';

import Button from './Button.svelte';
import Disc from './Disc.svelte';

export default function Turntable($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { isPlaying = false, volume = 0, $$slots, $$events, ...rest } = $$props;
		let discSpeed = new Tween(0, { duration: 1e3 });
		let armPos = new Spring(0);
		let started = false;

		const toggle = async () => {
			if (!started) {
				await context.resume();
				started = true;
			}

			if (isPlaying) {
				discSpeed.set(0);
				armPos.set(0);
				isPlaying = false;
			} else {
				discSpeed.set(1);
				armPos.set(1);
				isPlaying = true;
			}
		};

		let audio = void 0;
		const { context } = useAudioListener();
		const analyser = context.createAnalyser();
		const pcmData = new Float32Array(analyser.fftSize);

		useTask(() => {
			if (!audio) return;

			analyser.getFloatTimeDomainData(pcmData);

			let sumSquares = 0.0;

			for (const amplitude of pcmData) {
				sumSquares += amplitude * amplitude;
			}

			volume = Math.sqrt(sumSquares / pcmData.length);
		});

		let sideA = '/audio/side_a.mp3';
		let sideB = '/audio/side_b.mp3';
		let source = sideA;

		const changeSide = () => {
			source = source === sideA ? sideB : sideA;
		};

		let coverOpen = false;
		const coverAngle = new Spring(0);
		const { onPointerEnter, onPointerLeave } = useCursor();
		const gltf = useGltf('/models/turntable/cover.glb');
		const coverGeometry = $.derived(() => $.store_get($$store_subs ??= {}, '$gltf', gltf)?.nodes.Cover.geometry);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (T.Group) {
				$$renderer.push('<!--[-->');

				T.Group($$renderer, $.spread_props([
					rest,
					{
						children: ($$renderer) => {
							Disc($$renderer, {
								'position.x': 0.5,
								'position.y': 1.01,
								discSpeed: discSpeed.current
							});

							$$renderer.push(`<!----> `);

							if (T.Mesh) {
								$$renderer.push('<!--[-->');

								T.Mesh($$renderer, {
									receiveShadow: true,
									castShadow: true,
									'position.y': 0.5,
									children: ($$renderer) => {
										if (T.BoxGeometry) {
											$$renderer.push('<!--[-->');
											T.BoxGeometry($$renderer, { args: [6, 1, 4.4] });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (T.MeshStandardMaterial) {
											$$renderer.push('<!--[-->');
											T.MeshStandardMaterial($$renderer, { color: '#eedbcb' });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);
										Edges($$renderer, { scale: 1.001, color: 'black', raycast: () => null });
										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (T.Group) {
								$$renderer.push('<!--[-->');

								T.Group($$renderer, {
									'position.y': 1,
									'position.z': -2.2,
									'rotation.x': -coverAngle.current * MathUtils.DEG2RAD,
									children: ($$renderer) => {
										if (coverGeometry()) {
											$$renderer.push('<!--[0-->');

											if (T.Mesh) {
												$$renderer.push('<!--[-->');

												T.Mesh($$renderer, {
													geometry: coverGeometry(),
													scale: [3, 0.5, 2.2],
													'position.y': 0.5,
													'position.z': 2.2,
													onclick: () => coverOpen = !coverOpen,
													onpointerenter: onPointerEnter,
													onpointerleave: onPointerLeave,
													children: ($$renderer) => {
														if (T.MeshStandardMaterial) {
															$$renderer.push('<!--[-->');

															T.MeshStandardMaterial($$renderer, {
																color: '#ffffff',
																roughness: 0.08,
																metalness: 0.8,
																envMapIntensity: 1,
																side: DoubleSide,
																transparent: true,
																opacity: 0.65
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);
														Edges($$renderer, { color: 'white', raycast: () => null });
														$$renderer.push(`<!---->`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]-->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							Button($$renderer, {
								position: [-2.3, 1.01, 0.8],
								onClick: changeSide,
								text: source === sideA ? 'SIDE B' : 'SIDE A'
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								position: [-2.3, 1.01, 1.7],
								onClick: toggle,
								text: isPlaying ? 'PAUSE' : 'PLAY'
							});

							$$renderer.push(`<!----> `);

							if (T.Group) {
								$$renderer.push('<!--[-->');

								T.Group($$renderer, {
									position: [2.5, 1.55, -1.8],
									'rotation.z': MathUtils.DEG2RAD * 90,
									'rotation.y': MathUtils.DEG2RAD * 90 - armPos.current * 0.3,
									children: ($$renderer) => {
										if (T.Mesh) {
											$$renderer.push('<!--[-->');

											T.Mesh($$renderer, {
												castShadow: true,
												'position.y': 1.5,
												children: ($$renderer) => {
													if (T.CylinderGeometry) {
														$$renderer.push('<!--[-->');
														T.CylinderGeometry($$renderer, { args: [0.1, 0.1, 3, 12] });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (T.MeshStandardMaterial) {
														$$renderer.push('<!--[-->');
														T.MeshStandardMaterial($$renderer, { color: '#ffffff' });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);
													Edges($$renderer, { color: 'black', thresholdAngle: 80, raycast: () => null });
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
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (started) {
								$$renderer.push('<!--[0-->');

								PositionalAudio($$renderer, {
									autoplay: true,
									refDistance: 15,
									loop: true,
									playbackRate: discSpeed.current,
									src: source,
									directionalCone: { coneInnerAngle: 90, coneOuterAngle: 220, coneOuterGain: 0.3 },
									get ref() {
										return audio;
									},

									set ref($$value) {
										audio = $$value;
										$$settled = false;
									}
								});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					}
				]));

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { isPlaying, volume, toggle });
	});
}