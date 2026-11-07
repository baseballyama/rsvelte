import * as $ from 'svelte/internal/server';
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

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let sheet = void 0;
		const { scene } = useThrelte();
		let fov = $.derived(() => innerWidth.current ?? 0 > 640 ? 35 : 40);

		if (T.Group) {
			$$renderer.push('<!--[-->');

			T.Group($$renderer, {
				'position.x': -mouseCoordsSpring.current.x * 0.6,
				children: ($$renderer) => {
					ScrollSheet($$renderer, {
						name: 'Star Fields',
						startAtScrollPosition: 4,
						endAtScrollPosition: 5,
						children: ($$renderer) => {
							AnimatableStarField($$renderer, { key: 'Star Field' });
							$$renderer.push(`<!----> `);
							AnimatableStarField($$renderer, { key: 'Star Field Top' });
							$$renderer.push(`<!---->`);
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

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');

			T.PerspectiveCamera($$renderer, {
				makeDefault: $.store_get($$store_subs ??= {}, '$debug', debug),
				oncreate: (ref) => {
					ref.position.set(10, 10, 10);
					ref.lookAt(0, 0, 0);
				},

				children: ($$renderer) => {
					if ($.store_get($$store_subs ??= {}, '$debug', debug)) {
						$$renderer.push('<!--[0-->');
						OrbitControls($$renderer, {});
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

		ScrollSheet($$renderer, {
			name: 'Scene',
			startAtScrollPosition: 0,
			endAtScrollPosition: 3,
			children: ($$renderer) => {
				{
					function children($$renderer, { Transform }) {
						{
							function children($$renderer, { transform }) {
								if (Transform) {
									$$renderer.push('<!--[-->');

									Transform($$renderer, $.spread_props([
										transform,
										{
											children: ($$renderer) => {
												{
													function children($$renderer, { ref: camera }) {
														if ($.store_get($$store_subs ??= {}, '$debug', debug)) {
															$$renderer.push('<!--[0-->');

															if (T.CameraHelper) {
																$$renderer.push('<!--[-->');
																T.CameraHelper($$renderer, { args: [camera], attach: scene });
																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}
														} else {
															$$renderer.push('<!--[-1-->');
														}

														$$renderer.push(`<!--]-->`);
													}

													if (T.PerspectiveCamera) {
														$$renderer.push('<!--[-->');

														T.PerspectiveCamera($$renderer, {
															fov: fov(),
															makeDefault: !$.store_get($$store_subs ??= {}, '$debug', debug),
															children,
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}
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

							KeyboardControls($$renderer, { children, $$slots: { default: true } });
						}
					}

					SheetObject($$renderer, { key: 'Camera', children, $$slots: { default: true } });
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		if ($.store_get($$store_subs ??= {}, '$debug', debug)) {
			$$renderer.push('<!--[0-->');
			Grid($$renderer, {});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		ScrollSheet($$renderer, {
			useSpring: false,
			name: 'Threlte-Composite-Unsprung',
			startAtScrollPosition: 3.5,
			endAtScrollPosition: 5,
			children: ($$renderer) => {
				{
					function children($$renderer, { Transform }) {
						if (Transform) {
							$$renderer.push('<!--[-->');

							Transform($$renderer, {
								children: ($$renderer) => {
									if (T.Group) {
										$$renderer.push('<!--[-->');

										T.Group($$renderer, {
											'position.x': -mouseCoordsSpring.current.x * 0.2,
											'position.y': mouseCoordsSpring.current.y * 0.1,
											children: ($$renderer) => {
												ScrollSheet($$renderer, {
													name: 'Threlte-Composite',
													startAtScrollPosition: 0,
													endAtScrollPosition: 3,
													children: ($$renderer) => {
														{
															function children($$renderer, { values }) {
																PostProcessing($$renderer, {
																	bloomIntensity: values.bloomIntensity,
																	bloomLuminanceSmoothing: values.bloomLuminanceSmoothing,
																	bloomRadius: values.bloomRadius,
																	brightness: values.brightness,
																	contrast: values.contrast,
																	noiseIntensity: values.noiseIntensity
																});
															}

															SheetObject($$renderer, {
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

														$$renderer.push(`<!----> `);

														{
															function children($$renderer, { Transform, Sync }) {
																{
																	function children($$renderer, { transform }) {
																		if (Transform) {
																			$$renderer.push('<!--[-->');

																			Transform($$renderer, $.spread_props([
																				transform,
																				{
																					children: ($$renderer) => {
																						{
																							function children($$renderer, { ref }) {
																								if (T.Mesh) {
																									$$renderer.push('<!--[-->');

																									T.Mesh($$renderer, {
																										'position.z': 0.1,
																										scale: 0.8,
																										children: ($$renderer) => {
																											if (T.PlaneGeometry) {
																												$$renderer.push('<!--[-->');
																												T.PlaneGeometry($$renderer, { args: [10, 10] });
																												$$renderer.push('<!--]-->');
																											} else {
																												$$renderer.push('<!--[!-->');
																												$$renderer.push('<!--]-->');
																											}

																											$$renderer.push(` `);

																											if (T.MeshBasicMaterial) {
																												$$renderer.push('<!--[-->');

																												T.MeshBasicMaterial($$renderer, {
																													transparent: true,
																													alphaMap: ref,
																													children: ($$renderer) => {
																														if (Sync) {
																															$$renderer.push('<!--[-->');
																															Sync($$renderer, { opacity: 'opacity2', color: 'color2' });
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
																										children: ($$renderer) => {
																											if (T.PlaneGeometry) {
																												$$renderer.push('<!--[-->');
																												T.PlaneGeometry($$renderer, { args: [10, 10] });
																												$$renderer.push('<!--]-->');
																											} else {
																												$$renderer.push('<!--[!-->');
																												$$renderer.push('<!--]-->');
																											}

																											$$renderer.push(` `);

																											if (T.MeshBasicMaterial) {
																												$$renderer.push('<!--[-->');

																												T.MeshBasicMaterial($$renderer, {
																													transparent: true,
																													alphaMap: ref,
																													children: ($$renderer) => {
																														if (Sync) {
																															$$renderer.push('<!--[-->');
																															Sync($$renderer, { opacity: true, color: true });
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
																							}

																							RadialGradientTexture($$renderer, {
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
																				}
																			]));

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}
																	}

																	KeyboardControls($$renderer, { children, $$slots: { default: true } });
																}
															}

															SheetObject($$renderer, { key: 'Glow', children, $$slots: { default: true } });
														}

														$$renderer.push(`<!----> `);

														{
															function children($$renderer, { Transform, values }) {
																Float($$renderer, {
																	floatIntensity: values.floatIntensity,
																	rotationIntensity: values.rotationIntensity,
																	rotationSpeed: values.rotationSpeed,
																	speed: values.floatSpeed,
																	children: ($$renderer) => {
																		{
																			function children($$renderer, { transform }) {
																				if (Transform) {
																					$$renderer.push('<!--[-->');

																					Transform($$renderer, $.spread_props([
																						transform,
																						{
																							children: ($$renderer) => {
																								AnimatableCube($$renderer, { key: 'Box Top' });
																								$$renderer.push(`<!----> `);
																								AnimatableCube($$renderer, { key: 'Box Middle' });
																								$$renderer.push(`<!----> `);
																								AnimatableCube($$renderer, { key: 'Box Bottom X+' });
																								$$renderer.push(`<!----> `);
																								AnimatableCube($$renderer, { key: 'Box Bottom X-' });
																								$$renderer.push(`<!----> `);
																								AnimatableCube($$renderer, { key: 'Box Bottom Z+' });
																								$$renderer.push(`<!----> `);
																								AnimatableCube($$renderer, { key: 'Box Bottom Z-' });
																								$$renderer.push(`<!---->`);
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

																			KeyboardControls($$renderer, { children, $$slots: { default: true } });
																		}
																	},
																	$$slots: { default: true }
																});
															}

															SheetObject($$renderer, {
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

														$$renderer.push(`<!---->`);
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
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}

					SheetObject($$renderer, { key: 'composite', children, $$slots: { default: true } });
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}