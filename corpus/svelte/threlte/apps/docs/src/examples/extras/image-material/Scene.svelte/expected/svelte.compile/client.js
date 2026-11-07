import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fragmentShader, vertexShader } from './rgbaProcessingTexture';
import { BentPlaneGeometry } from './BentPlaneGeometry';
import { Card } from './Card.svelte';

import {
	DoubleSide,
	OrthographicCamera,
	PerspectiveCamera,
	Scene,
	Texture,
	Uniform,
	WebGLRenderTarget
} from 'three';

import {
	HTML,
	HUD,
	ImageMaterial,
	OrbitControls,
	Suspense,
	interactivity,
	useTexture,
	useViewport
} from '@threlte/extras';

import { T, useTask, useThrelte } from '@threlte/core';

const urls = [
	'/textures/paintings/caravaggio.jpg',
	'/textures/paintings/vangogh.jpg',
	'/textures/paintings/klimt.jpg',
	'/textures/paintings/seghers.jpg',
	'/textures/paintings/vollon.jpg',
	'/textures/paintings/swan.jpg'
];

const count = 5;
const names = ['Hue(R)', 'Saturation(G)', 'Lightness(B)', 'Alpha(A)'];
var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<span> </span>`);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Scene_1($$anchor, $$props) {
	$.push($$props, true);

	const $viewport = () => $.store_get(viewport, '$viewport', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let alphaSmoothing = $.prop($$props, 'alphaSmoothing', 3, 0.15),
		alphaThreshold = $.prop($$props, 'alphaThreshold', 3, 0.5),
		brightness = $.prop($$props, 'brightness', 3, 0),
		contrast = $.prop($$props, 'contrast', 3, 0),
		hue = $.prop($$props, 'hue', 3, 0),
		lightness = $.prop($$props, 'lightness', 3, 0),
		monochromeColor = $.prop($$props, 'monochromeColor', 3, '#ed8922'),
		monochromeStrength = $.prop($$props, 'monochromeStrength', 3, 0),
		negative = $.prop($$props, 'negative', 3, false),
		saturation = $.prop($$props, 'saturation', 3, 0),
		textureOverrideEnabled = $.prop($$props, 'textureOverrideEnabled', 3, false);

	const viewport = useViewport();
	const { autoRenderTask, renderer } = useThrelte();

	interactivity();

	const radius = 1.4;
	const TAU = 2 * Math.PI;
	const cards = $.derived(() => urls.map((url) => new Card(url)));
	const uTime = new Uniform(0);
	const uAlphaTexture = new Uniform(null);

	useTexture('/textures/alpha.jpg').then((texture) => {
		uAlphaTexture.value = texture;
	});

	const scene = new Scene();
	const orthoCamera = new OrthographicCamera(-1, 1, 1 - 1, -1, 1);
	const rgbaTextureTarget = new WebGLRenderTarget(256, 256, { count });

	const colorProcessingTexture = $.derived(() => {
		if (!textureOverrideEnabled()) return;

		return rgbaTextureTarget.textures[0];
	});

	for (let i = 0, l = names.length; i < l; i += 1) {
		const texture = rgbaTextureTarget.textures[i + 1];

		if (texture) texture.name = names[i] ?? '';
	}

	useTask(
		(delta) => {
			uTime.value += delta;

			const lastRenderTarget = renderer.getRenderTarget();

			renderer.setRenderTarget(rgbaTextureTarget);
			renderer.render(scene, orthoCamera);
			renderer.setRenderTarget(lastRenderTarget);
		},
		{
			running: () => textureOverrideEnabled(),
			before: autoRenderTask
		}
	);

	const camera = new PerspectiveCamera();
	var fragment = root_2();
	var node = $.first_child(fragment);

	T(node, {
		get is() {
			return camera;
		},
		makeDefault: true,
		fov: 20,
		position: [2, 2, 10],
		children: ($$anchor, $$slotProps) => {
			OrbitControls($$anchor, {
				autoRotate: true,
				enableDamping: true,
				enableZoom: false,
				enablePan: false
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			get attach() {
				return scene;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root();
				var node_2 = $.first_child(fragment_2);

				$.component(node_2, () => T.PlaneGeometry, ($$anchor, T_PlaneGeometry) => {
					T_PlaneGeometry($$anchor, { args: [2, 2] });
				});

				var node_3 = $.sibling(node_2, 2);

				$.component(node_3, () => T.ShaderMaterial, ($$anchor, T_ShaderMaterial) => {
					T_ShaderMaterial($$anchor, {
						get fragmentShader() {
							return fragmentShader;
						},

						get vertexShader() {
							return vertexShader;
						},

						get 'uniforms.uTime'() {
							return uTime;
						},

						get 'uniforms.uAlphaTexture'() {
							return uAlphaTexture;
						}
					});
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});
	});

	var node_4 = $.sibling(node_1, 2);

	HUD(node_4, {
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root();
			var node_5 = $.first_child(fragment_3);

			$.component(node_5, () => T.OrthographicCamera, ($$anchor, T_OrthographicCamera) => {
				T_OrthographicCamera($$anchor, { makeDefault: true, 'position.z': 10, zoom: 100 });
			});

			var node_6 = $.sibling(node_5, 2);

			{
				let $0 = $.derived(() => -1 * $viewport().width + 1);
				let $1 = $.derived(() => 1 * 0.5 * $viewport().height + 1);

				$.component(node_6, () => T.Group, ($$anchor, T_Group) => {
					T_Group($$anchor, {
						get 'position.x'() {
							return $.get($0);
						},

						get 'position.y'() {
							return $.get($1);
						},

						get visible() {
							return textureOverrideEnabled();
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_4 = $.comment();
							var node_7 = $.first_child(fragment_4);

							$.each(node_7, 17, () => names, $.index, ($$anchor, text, index) => {
								var fragment_5 = $.comment();
								var node_8 = $.first_child(fragment_5);

								$.component(node_8, () => T.Group, ($$anchor, T_Group_1) => {
									T_Group_1($$anchor, {
										'position.x': index,
										children: ($$anchor, $$slotProps) => {
											var fragment_6 = root();
											var node_9 = $.first_child(fragment_6);

											$.component(node_9, () => T.Mesh, ($$anchor, T_Mesh_1) => {
												T_Mesh_1($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_7 = root();
														var node_10 = $.first_child(fragment_7);

														{
															let $0 = $.derived(() => rgbaTextureTarget.textures[index + 1] ?? null);

															$.component(node_10, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
																T_MeshBasicMaterial($$anchor, {
																	get map() {
																		return $.get($0);
																	}
																});
															});
														}

														var node_11 = $.sibling(node_10, 2);

														$.component(node_11, () => T.PlaneGeometry, ($$anchor, T_PlaneGeometry_1) => {
															T_PlaneGeometry_1($$anchor, {});
														});

														$.append($$anchor, fragment_7);
													},
													$$slots: { default: true }
												});
											});

											var node_12 = $.sibling(node_9, 2);

											HTML(node_12, {
												center: true,
												children: ($$anchor, $$slotProps) => {
													var span = root_1();
													let styles;
													var text_1 = $.only_child(span, true);

													$.template_effect(() => {
														styles = $.set_style(span, '', styles, { color: 'white', opacity: +textureOverrideEnabled() });
														$.set_text(text_1, $.get(text));
													});

													$.append($$anchor, span);
												},
												$$slots: { default: true }
											});

											$.append($$anchor, fragment_6);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_5);
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				});
			}

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	var node_13 = $.sibling(node_4, 2);

	Suspense(node_13, {
		children: ($$anchor, $$slotProps) => {
			var fragment_8 = $.comment();
			var node_14 = $.first_child(fragment_8);

			$.each(node_14, 17, () => $.get(cards), $.index, ($$anchor, card, index) => {
				const r = $.derived(() => index / $.get(cards).length);
				const v = $.derived(() => $.get(r) * TAU);
				var fragment_9 = $.comment();
				var node_15 = $.first_child(fragment_9);

				{
					let $0 = $.derived(() => [radius * Math.sin($.get(v)), 0, radius * Math.cos($.get(v))]);
					let $1 = $.derived(() => [0, Math.PI + $.get(v), 0]);

					$.component(node_15, () => T.Mesh, ($$anchor, T_Mesh_2) => {
						T_Mesh_2($$anchor, {
							get scale() {
								return $.get(card).scale.current;
							},

							get position() {
								return $.get($0);
							},

							get rotation() {
								return $.get($1);
							},

							onpointerenter: (e) => {
								e.stopPropagation();
								$.get(card).radius.set(0.25);
								$.get(card).scale.set(1.3);
								$.get(card).zoom.set(1.25);
							},

							onpointerleave: (e) => {
								e.stopPropagation();
								$.get(card).radius.set(0.1);
								$.get(card).scale.set(1);
								$.get(card).zoom.set(1);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_10 = root();
								var node_16 = $.first_child(fragment_10);

								T(node_16, {
									get is() {
										return BentPlaneGeometry;
									},
									args: [0.1, 1, 1, 20, 20]
								});

								var node_17 = $.sibling(node_16, 2);

								ImageMaterial(node_17, {
									get radius() {
										return $.get(card).radius.current;
									},

									get side() {
										return DoubleSide;
									},
									transparent: true,
									get url() {
										return $.get(card).url;
									},

									get zoom() {
										return $.get(card).zoom.current;
									},

									get alphaSmoothing() {
										return alphaSmoothing();
									},

									get alphaThreshold() {
										return alphaThreshold();
									},

									get brightness() {
										return brightness();
									},

									get colorProcessingTexture() {
										return $.get(colorProcessingTexture);
									},

									get contrast() {
										return contrast();
									},

									get hue() {
										return hue();
									},

									get lightness() {
										return lightness();
									},

									get monochromeColor() {
										return monochromeColor();
									},

									get monochromeStrength() {
										return monochromeStrength();
									},

									get negative() {
										return negative();
									},

									get saturation() {
										return saturation();
									}
								});

								$.append($$anchor, fragment_10);
							},
							$$slots: { default: true }
						});
					});
				}

				$.append($$anchor, fragment_9);
			});

			$.append($$anchor, fragment_8);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}