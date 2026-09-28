import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useThrelte } from '@threlte/core';
import { Float, Grid, OrbitControls, RadialGradientTexture } from '@threlte/extras';
import { SheetObject } from '@threlte/theatre';
import AnimatableCube from './AnimatableCube.svelte';
import AnimatableStarField from './AnimatableStarField.svelte';
import KeyboardControls from './KeyboardControls.svelte';
import PostProcessing from './PostProcessing.svelte';
import ScrollSheet from './ScrollSheet.svelte';
import { mouseCoordsSpring, springScrollPos } from './scrollPos';
import { debug } from './state';
import { innerWidth } from 'svelte/reactivity/window';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const $springScrollPos = () => $.store_get(springScrollPos, '$springScrollPos', $$stores);
	const $debug = () => $.store_get(debug, '$debug', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let sheet = void 0;

	$.user_effect(() => {
		if (sheet) {
			sheet.sequence.position = $springScrollPos() * 10;
		}
	});

	const { scene } = useThrelte();
	let fov = $.derived(() => innerWidth.current ?? 0 > 640 ? 35 : 40);
	var fragment = root_3();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => -mouseCoordsSpring.current.x * 0.6);

		$.component(node, () => T.Group, ($$anchor, T_Group) => {
			T_Group($$anchor, {
				get 'position.x'() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					ScrollSheet($$anchor, {
						name: 'Star Fields',
						startAtScrollPosition: 4,
						endAtScrollPosition: 5,
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_1 = $.first_child(fragment_2);

							AnimatableStarField(node_1, { key: 'Star Field' });

							var node_2 = $.sibling(node_1, 2);

							AnimatableStarField(node_2, { key: 'Star Field Top' });
							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		});
	}

	var node_3 = $.sibling(node, 2);

	$.component(node_3, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			get makeDefault() {
				return $debug();
			},

			oncreate: (ref) => {
				ref.position.set(10, 10, 10);
				ref.lookAt(0, 0, 0);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_3 = $.comment();
				var node_4 = $.first_child(fragment_3);

				{
					var consequent = ($$anchor) => {
						OrbitControls($$anchor, {});
					};

					$.if(node_4, ($$render) => {
						if ($debug()) $$render(consequent);
					});
				}

				$.append($$anchor, fragment_3);
			},
			$$slots: { default: true }
		});
	});

	var node_5 = $.sibling(node_3, 2);

	ScrollSheet(node_5, {
		name: 'Scene',
		startAtScrollPosition: 0,
		endAtScrollPosition: 3,
		children: ($$anchor, $$slotProps) => {
			{
				const children = ($$anchor, $$arg0) => {
					let Transform = () => ($$arg0?.()).Transform;

					{
						const children = ($$anchor, $$arg0) => {
							let transform = () => ($$arg0?.()).transform;
							var fragment_7 = $.comment();
							var node_6 = $.first_child(fragment_7);

							$.component(node_6, Transform, ($$anchor, Transform_1) => {
								Transform_1($$anchor, $.spread_props(transform, {
									children: ($$anchor, $$slotProps) => {
										var fragment_8 = $.comment();
										var node_7 = $.first_child(fragment_8);

										{
											const children = ($$anchor, $$arg0) => {
												let camera = () => ($$arg0?.()).ref;
												var fragment_9 = $.comment();
												var node_8 = $.first_child(fragment_9);

												{
													var consequent_1 = ($$anchor) => {
														var fragment_10 = $.comment();
														var node_9 = $.first_child(fragment_10);

														{
															let $0 = $.derived(() => [camera()]);

															$.component(node_9, () => T.CameraHelper, ($$anchor, T_CameraHelper) => {
																T_CameraHelper($$anchor, {
																	get args() {
																		return $.get($0);
																	},

																	get attach() {
																		return scene;
																	}
																});
															});
														}

														$.append($$anchor, fragment_10);
													};

													$.if(node_8, ($$render) => {
														if ($debug()) $$render(consequent_1);
													});
												}

												$.append($$anchor, fragment_9);
											};

											let $0 = $.derived(() => !$debug());

											$.component(node_7, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera_1) => {
												T_PerspectiveCamera_1($$anchor, {
													get fov() {
														return $.get(fov);
													},

													get makeDefault() {
														return $.get($0);
													},
													children,
													$$slots: { default: true }
												});
											});
										}

										$.append($$anchor, fragment_8);
									},
									$$slots: { default: true }
								}));
							});

							$.append($$anchor, fragment_7);
						};

						KeyboardControls($$anchor, { children, $$slots: { default: true } });
					}
				};

				SheetObject($$anchor, { key: 'Camera', children, $$slots: { default: true } });
			}
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_5, 2);

	{
		var consequent_2 = ($$anchor) => {
			Grid($$anchor, {});
		};

		$.if(node_10, ($$render) => {
			if ($debug()) $$render(consequent_2);
		});
	}

	var node_11 = $.sibling(node_10, 2);

	ScrollSheet(node_11, {
		useSpring: false,
		name: 'Threlte-Composite-Unsprung',
		startAtScrollPosition: 3.5,
		endAtScrollPosition: 5,
		children: ($$anchor, $$slotProps) => {
			{
				const children = ($$anchor, $$arg0) => {
					let Transform = () => ($$arg0?.()).Transform;
					var fragment_13 = $.comment();
					var node_12 = $.first_child(fragment_13);

					$.component(node_12, Transform, ($$anchor, Transform_2) => {
						Transform_2($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_14 = $.comment();
								var node_13 = $.first_child(fragment_14);

								{
									let $0 = $.derived(() => -mouseCoordsSpring.current.x * 0.2);
									let $1 = $.derived(() => mouseCoordsSpring.current.y * 0.1);

									$.component(node_13, () => T.Group, ($$anchor, T_Group_1) => {
										T_Group_1($$anchor, {
											get 'position.x'() {
												return $.get($0);
											},

											get 'position.y'() {
												return $.get($1);
											},

											children: ($$anchor, $$slotProps) => {
												ScrollSheet($$anchor, {
													name: 'Threlte-Composite',
													startAtScrollPosition: 0,
													endAtScrollPosition: 3,
													children: ($$anchor, $$slotProps) => {
														var fragment_16 = root_2();
														var node_14 = $.first_child(fragment_16);

														{
															const children = ($$anchor, $$arg0) => {
																let values = () => ($$arg0?.()).values;

																PostProcessing($$anchor, {
																	get bloomIntensity() {
																		return values().bloomIntensity;
																	},

																	get bloomLuminanceSmoothing() {
																		return values().bloomLuminanceSmoothing;
																	},

																	get bloomRadius() {
																		return values().bloomRadius;
																	},

																	get brightness() {
																		return values().brightness;
																	},

																	get contrast() {
																		return values().contrast;
																	},

																	get noiseIntensity() {
																		return values().noiseIntensity;
																	}
																});
															};

															SheetObject(node_14, {
																key: 'Post Processing',
																props: {
																	bloomIntensity: 2,
																	bloomRadius: 0.6,
																	bloomLuminanceSmoothing: 0.025,
																	brightness: 0,
																	contrast: 0,
																	noiseIntensity: 0.03
																},
																children,
																$$slots: { default: true }
															});
														}

														var node_15 = $.sibling(node_14, 2);

														{
															const children = ($$anchor, $$arg0) => {
																let Transform = () => ($$arg0?.()).Transform;
																let Sync = () => ($$arg0?.()).Sync;

																{
																	const children = ($$anchor, $$arg0) => {
																		let transform = () => ($$arg0?.()).transform;
																		var fragment_19 = $.comment();
																		var node_16 = $.first_child(fragment_19);

																		$.component(node_16, Transform, ($$anchor, Transform_3) => {
																			Transform_3($$anchor, $.spread_props(transform, {
																				children: ($$anchor, $$slotProps) => {
																					{
																						const children = ($$anchor, $$arg0) => {
																							let ref = () => ($$arg0?.()).ref;
																							var fragment_21 = root();
																							var node_17 = $.first_child(fragment_21);

																							$.component(node_17, () => T.Mesh, ($$anchor, T_Mesh) => {
																								T_Mesh($$anchor, {
																									'position.z': 0.1,
																									scale: 0.8,
																									children: ($$anchor, $$slotProps) => {
																										var fragment_22 = root();
																										var node_18 = $.first_child(fragment_22);

																										$.component(node_18, () => T.PlaneGeometry, ($$anchor, T_PlaneGeometry) => {
																											T_PlaneGeometry($$anchor, { args: [10, 10] });
																										});

																										var node_19 = $.sibling(node_18, 2);

																										$.component(node_19, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
																											T_MeshBasicMaterial($$anchor, {
																												transparent: true,
																												get alphaMap() {
																													return ref();
																												},

																												children: ($$anchor, $$slotProps) => {
																													var fragment_23 = $.comment();
																													var node_20 = $.first_child(fragment_23);

																													$.component(node_20, Sync, ($$anchor, Sync_1) => {
																														Sync_1($$anchor, { opacity: 'opacity2', color: 'color2' });
																													});

																													$.append($$anchor, fragment_23);
																												},
																												$$slots: { default: true }
																											});
																										});

																										$.append($$anchor, fragment_22);
																									},
																									$$slots: { default: true }
																								});
																							});

																							var node_21 = $.sibling(node_17, 2);

																							$.component(node_21, () => T.Mesh, ($$anchor, T_Mesh_1) => {
																								T_Mesh_1($$anchor, {
																									children: ($$anchor, $$slotProps) => {
																										var fragment_24 = root();
																										var node_22 = $.first_child(fragment_24);

																										$.component(node_22, () => T.PlaneGeometry, ($$anchor, T_PlaneGeometry_1) => {
																											T_PlaneGeometry_1($$anchor, { args: [10, 10] });
																										});

																										var node_23 = $.sibling(node_22, 2);

																										$.component(node_23, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial_1) => {
																											T_MeshBasicMaterial_1($$anchor, {
																												transparent: true,
																												get alphaMap() {
																													return ref();
																												},

																												children: ($$anchor, $$slotProps) => {
																													var fragment_25 = $.comment();
																													var node_24 = $.first_child(fragment_25);

																													$.component(node_24, Sync, ($$anchor, Sync_2) => {
																														Sync_2($$anchor, { opacity: true, color: true });
																													});

																													$.append($$anchor, fragment_25);
																												},
																												$$slots: { default: true }
																											});
																										});

																										$.append($$anchor, fragment_24);
																									},
																									$$slots: { default: true }
																								});
																							});

																							$.append($$anchor, fragment_21);
																						};

																						RadialGradientTexture($$anchor, {
																							attach: false,
																							outerRadius: 512,
																							stops: [
																								{ color: '#ffffff', offset: 0 },
																								{ color: '#000000', offset: 1 }
																							],
																							children,
																							$$slots: { default: true }
																						});
																					}
																				},
																				$$slots: { default: true }
																			}));
																		});

																		$.append($$anchor, fragment_19);
																	};

																	KeyboardControls($$anchor, { children, $$slots: { default: true } });
																}
															};

															SheetObject(node_15, { key: 'Glow', children, $$slots: { default: true } });
														}

														var node_25 = $.sibling(node_15, 2);

														{
															const children = ($$anchor, $$arg0) => {
																let Transform = () => ($$arg0?.()).Transform;
																let values = () => ($$arg0?.()).values;

																Float($$anchor, {
																	get floatIntensity() {
																		return values().floatIntensity;
																	},

																	get rotationIntensity() {
																		return values().rotationIntensity;
																	},

																	get rotationSpeed() {
																		return values().rotationSpeed;
																	},

																	get speed() {
																		return values().floatSpeed;
																	},

																	children: ($$anchor, $$slotProps) => {
																		{
																			const children = ($$anchor, $$arg0) => {
																				let transform = () => ($$arg0?.()).transform;
																				var fragment_28 = $.comment();
																				var node_26 = $.first_child(fragment_28);

																				$.component(node_26, Transform, ($$anchor, Transform_4) => {
																					Transform_4($$anchor, $.spread_props(transform, {
																						children: ($$anchor, $$slotProps) => {
																							var fragment_29 = root_1();
																							var node_27 = $.first_child(fragment_29);

																							AnimatableCube(node_27, { key: 'Box Top' });

																							var node_28 = $.sibling(node_27, 2);

																							AnimatableCube(node_28, { key: 'Box Middle' });

																							var node_29 = $.sibling(node_28, 2);

																							AnimatableCube(node_29, { key: 'Box Bottom X+' });

																							var node_30 = $.sibling(node_29, 2);

																							AnimatableCube(node_30, { key: 'Box Bottom X-' });

																							var node_31 = $.sibling(node_30, 2);

																							AnimatableCube(node_31, { key: 'Box Bottom Z+' });

																							var node_32 = $.sibling(node_31, 2);

																							AnimatableCube(node_32, { key: 'Box Bottom Z-' });
																							$.append($$anchor, fragment_29);
																						},
																						$$slots: { default: true }
																					}));
																				});

																				$.append($$anchor, fragment_28);
																			};

																			KeyboardControls($$anchor, { children, $$slots: { default: true } });
																		}
																	},
																	$$slots: { default: true }
																});
															};

															SheetObject(node_25, {
																key: 'Composite',
																props: {
																	floatIntensity: 1,
																	rotationIntensity: 1,
																	rotationSpeed: 1,
																	floatSpeed: 1
																},
																children,
																$$slots: { default: true }
															});
														}

														$.append($$anchor, fragment_16);
													},
													$$slots: { default: true }
												});
											},
											$$slots: { default: true }
										});
									});
								}

								$.append($$anchor, fragment_14);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_13);
				};

				SheetObject($$anchor, { key: 'composite', children, $$slots: { default: true } });
			}
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}