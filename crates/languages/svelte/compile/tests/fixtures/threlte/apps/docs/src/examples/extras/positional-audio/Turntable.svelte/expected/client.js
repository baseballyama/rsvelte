import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'isPlaying', 'volume']);
var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Turntable($$anchor, $$props) {
	$.push($$props, true);

	const $gltf = () => $.store_get(gltf, '$gltf', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let isPlaying = $.prop($$props, 'isPlaying', 15, false),
		volume = $.prop($$props, 'volume', 15, 0),
		rest = $.rest_props($$props, rest_excludes);

	let discSpeed = new Tween(0, { duration: 1e3 });
	let armPos = new Spring(0);
	let started = $.state(false);

	const toggle = async () => {
		if (!$.get(started)) {
			await context.resume();
			$.set(started, true);
		}

		if (isPlaying()) {
			discSpeed.set(0);
			armPos.set(0);
			isPlaying(false);
		} else {
			discSpeed.set(1);
			armPos.set(1);
			isPlaying(true);
		}
	};

	let audio = $.state(void 0);
	const { context } = useAudioListener();
	const analyser = context.createAnalyser();

	$.user_effect(() => {
		if ($.get(audio)) $.get(audio).getOutput().connect(analyser);
	});

	const pcmData = new Float32Array(analyser.fftSize);

	useTask(() => {
		if (!$.get(audio)) return;

		analyser.getFloatTimeDomainData(pcmData);

		let sumSquares = 0.0;

		for (const amplitude of pcmData) {
			sumSquares += amplitude * amplitude;
		}

		volume(Math.sqrt(sumSquares / pcmData.length));
	});

	let sideA = '/audio/side_a.mp3';
	let sideB = '/audio/side_b.mp3';
	let source = $.state(sideA);

	const changeSide = () => {
		$.set(source, $.get(source) === sideA ? sideB : sideA, true);
	};

	let coverOpen = $.state(false);
	const coverAngle = new Spring(0);

	$.user_effect(() => {
		if ($.get(coverOpen)) coverAngle.set(80); else coverAngle.set(0);
	});

	const { onPointerEnter, onPointerLeave } = useCursor();
	const gltf = useGltf('/models/turntable/cover.glb');
	const coverGeometry = $.derived(() => $gltf()?.nodes.Cover.geometry);
	var $$exports = { toggle };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => T.Group, ($$anchor, T_Group) => {
		T_Group($$anchor, $.spread_props(() => rest, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var node_1 = $.first_child(fragment_1);

				Disc(node_1, {
					'position.x': 0.5,
					'position.y': 1.01,
					get discSpeed() {
						return discSpeed.current;
					}
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => T.Mesh, ($$anchor, T_Mesh) => {
					T_Mesh($$anchor, {
						receiveShadow: true,
						castShadow: true,
						'position.y': 0.5,
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
								T_BoxGeometry($$anchor, { args: [6, 1, 4.4] });
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
								T_MeshStandardMaterial($$anchor, { color: '#eedbcb' });
							});

							var node_5 = $.sibling(node_4, 2);

							Edges(node_5, { scale: 1.001, color: 'black', raycast: () => null });
							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_6 = $.sibling(node_2, 2);

				{
					let $0 = $.derived(() => -coverAngle.current * MathUtils.DEG2RAD);

					$.component(node_6, () => T.Group, ($$anchor, T_Group_1) => {
						T_Group_1($$anchor, {
							'position.y': 1,
							'position.z': -2.2,
							get 'rotation.x'() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_3 = $.comment();
								var node_7 = $.first_child(fragment_3);

								{
									var consequent = ($$anchor) => {
										var fragment_4 = $.comment();
										var node_8 = $.first_child(fragment_4);

										$.component(node_8, () => T.Mesh, ($$anchor, T_Mesh_1) => {
											T_Mesh_1($$anchor, {
												get geometry() {
													return $.get(coverGeometry);
												},
												scale: [3, 0.5, 2.2],
												'position.y': 0.5,
												'position.z': 2.2,
												onclick: () => $.set(coverOpen, !$.get(coverOpen)),
												get onpointerenter() {
													return onPointerEnter;
												},

												get onpointerleave() {
													return onPointerLeave;
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root_1();
													var node_9 = $.first_child(fragment_5);

													$.component(node_9, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
														T_MeshStandardMaterial_1($$anchor, {
															color: '#ffffff',
															roughness: 0.08,
															metalness: 0.8,
															envMapIntensity: 1,
															get side() {
																return DoubleSide;
															},
															transparent: true,
															opacity: 0.65
														});
													});

													var node_10 = $.sibling(node_9, 2);

													Edges(node_10, { color: 'white', raycast: () => null });
													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_4);
									};

									$.if(node_7, ($$render) => {
										if ($.get(coverGeometry)) $$render(consequent);
									});
								}

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					});
				}

				var node_11 = $.sibling(node_6, 2);

				{
					let $0 = $.derived(() => $.get(source) === sideA ? 'SIDE B' : 'SIDE A');

					Button(node_11, {
						position: [-2.3, 1.01, 0.8],
						onClick: changeSide,
						get text() {
							return $.get($0);
						}
					});
				}

				var node_12 = $.sibling(node_11, 2);

				{
					let $0 = $.derived(() => isPlaying() ? 'PAUSE' : 'PLAY');

					Button(node_12, {
						position: [-2.3, 1.01, 1.7],
						onClick: toggle,
						get text() {
							return $.get($0);
						}
					});
				}

				var node_13 = $.sibling(node_12, 2);

				{
					let $0 = $.derived(() => MathUtils.DEG2RAD * 90);
					let $1 = $.derived(() => MathUtils.DEG2RAD * 90 - armPos.current * 0.3);

					$.component(node_13, () => T.Group, ($$anchor, T_Group_2) => {
						T_Group_2($$anchor, {
							position: [2.5, 1.55, -1.8],
							get 'rotation.z'() {
								return $.get($0);
							},

							get 'rotation.y'() {
								return $.get($1);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_6 = $.comment();
								var node_14 = $.first_child(fragment_6);

								$.component(node_14, () => T.Mesh, ($$anchor, T_Mesh_2) => {
									T_Mesh_2($$anchor, {
										castShadow: true,
										'position.y': 1.5,
										children: ($$anchor, $$slotProps) => {
											var fragment_7 = root();
											var node_15 = $.first_child(fragment_7);

											$.component(node_15, () => T.CylinderGeometry, ($$anchor, T_CylinderGeometry) => {
												T_CylinderGeometry($$anchor, { args: [0.1, 0.1, 3, 12] });
											});

											var node_16 = $.sibling(node_15, 2);

											$.component(node_16, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_2) => {
												T_MeshStandardMaterial_2($$anchor, { color: '#ffffff' });
											});

											var node_17 = $.sibling(node_16, 2);

											Edges(node_17, { color: 'black', thresholdAngle: 80, raycast: () => null });
											$.append($$anchor, fragment_7);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_6);
							},
							$$slots: { default: true }
						});
					});
				}

				var node_18 = $.sibling(node_13, 2);

				{
					var consequent_1 = ($$anchor) => {
						PositionalAudio($$anchor, {
							autoplay: true,
							refDistance: 15,
							loop: true,
							get playbackRate() {
								return discSpeed.current;
							},

							get src() {
								return $.get(source);
							},
							directionalCone: { coneInnerAngle: 90, coneOuterAngle: 220, coneOuterGain: 0.3 },
							get ref() {
								return $.get(audio);
							},

							set ref($$value) {
								$.set(audio, $$value);
							}
						});
					};

					$.if(node_18, ($$render) => {
						if ($.get(started)) $$render(consequent_1);
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}));
	});

	$.append($$anchor, fragment);

	var $$pop = $.pop($$exports);

	$$cleanup();

	return $$pop;
}