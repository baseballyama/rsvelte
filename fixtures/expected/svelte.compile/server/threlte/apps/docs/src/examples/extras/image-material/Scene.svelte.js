import * as $ from 'svelte/internal/server';
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

export default function Scene_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			alphaSmoothing = 0.15,
			alphaThreshold = 0.5,
			brightness = 0,
			contrast = 0,
			hue = 0,
			lightness = 0,
			monochromeColor = '#ed8922',
			monochromeStrength = 0,
			negative = false,
			saturation = 0,
			textureOverrideEnabled = false
		} = $$props;

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
			if (!textureOverrideEnabled) return;

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
				running: () => textureOverrideEnabled,
				before: autoRenderTask
			}
		);

		const camera = new PerspectiveCamera();

		T($$renderer, {
			is: camera,
			makeDefault: true,
			fov: 20,
			position: [2, 2, 10],
			children: ($$renderer) => {
				OrbitControls($$renderer, {
					autoRotate: true,
					enableDamping: true,
					enableZoom: false,
					enablePan: false
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, {
				attach: scene,
				children: ($$renderer) => {
					if (T.PlaneGeometry) {
						$$renderer.push('<!--[-->');
						T.PlaneGeometry($$renderer, { args: [2, 2] });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.ShaderMaterial) {
						$$renderer.push('<!--[-->');

						T.ShaderMaterial($$renderer, {
							fragmentShader,
							vertexShader,
							'uniforms.uTime': uTime,
							'uniforms.uAlphaTexture': uAlphaTexture
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

		HUD($$renderer, {
			children: ($$renderer) => {
				if (T.OrthographicCamera) {
					$$renderer.push('<!--[-->');
					T.OrthographicCamera($$renderer, { makeDefault: true, 'position.z': 10, zoom: 100 });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (T.Group) {
					$$renderer.push('<!--[-->');

					T.Group($$renderer, {
						'position.x': -1 * $.store_get($$store_subs ??= {}, '$viewport', viewport).width + 1,
						'position.y': 1 * 0.5 * $.store_get($$store_subs ??= {}, '$viewport', viewport).height + 1,
						visible: textureOverrideEnabled,
						children: ($$renderer) => {
							$$renderer.push(`<!--[-->`);

							const each_array = $.ensure_array_like(names);

							for (let index = 0, $$length = each_array.length; index < $$length; index++) {
								let text = each_array[index];

								if (T.Group) {
									$$renderer.push('<!--[-->');

									T.Group($$renderer, {
										'position.x': index,
										children: ($$renderer) => {
											if (T.Mesh) {
												$$renderer.push('<!--[-->');

												T.Mesh($$renderer, {
													children: ($$renderer) => {
														if (T.MeshBasicMaterial) {
															$$renderer.push('<!--[-->');
															T.MeshBasicMaterial($$renderer, { map: rgbaTextureTarget.textures[index + 1] ?? null });
															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (T.PlaneGeometry) {
															$$renderer.push('<!--[-->');
															T.PlaneGeometry($$renderer, {});
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

											HTML($$renderer, {
												center: true,
												children: ($$renderer) => {
													$$renderer.push(`<span${$.attr_style('', { color: 'white', opacity: +textureOverrideEnabled })}>${$.escape(text)}</span>`);
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
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Suspense($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array_1 = $.ensure_array_like(cards());

				for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
					let card = each_array_1[index];
					const r = index / cards().length;
					const v = r * TAU;

					if (T.Mesh) {
						$$renderer.push('<!--[-->');

						T.Mesh($$renderer, {
							scale: card.scale.current,
							position: [radius * Math.sin(v), 0, radius * Math.cos(v)],
							rotation: [0, Math.PI + v, 0],
							onpointerenter: (e) => {
								e.stopPropagation();
								card.radius.set(0.25);
								card.scale.set(1.3);
								card.zoom.set(1.25);
							},

							onpointerleave: (e) => {
								e.stopPropagation();
								card.radius.set(0.1);
								card.scale.set(1);
								card.zoom.set(1);
							},

							children: ($$renderer) => {
								T($$renderer, { is: BentPlaneGeometry, args: [0.1, 1, 1, 20, 20] });
								$$renderer.push(`<!----> `);

								ImageMaterial($$renderer, {
									radius: card.radius.current,
									side: DoubleSide,
									transparent: true,
									url: card.url,
									zoom: card.zoom.current,
									alphaSmoothing,
									alphaThreshold,
									brightness,
									colorProcessingTexture: colorProcessingTexture(),
									contrast,
									hue,
									lightness,
									monochromeColor,
									monochromeStrength,
									negative,
									saturation
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
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}