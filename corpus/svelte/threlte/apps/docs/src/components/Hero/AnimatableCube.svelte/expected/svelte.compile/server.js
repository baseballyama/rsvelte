import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { SheetObject } from '@threlte/theatre';
import KeyboardControls from './KeyboardControls.svelte';
import { cubeGeometry } from './state';
import DissolveMaterial from './materials/DissolveMaterial.svelte';

export default function AnimatableCube($$renderer, $$props) {
	var $$store_subs;
	let { key } = $$props;

	{
		function children($$renderer, { Transform, Sync, Declare }) {
			{
				function children($$renderer, { transform }) {
					if (Transform) {
						$$renderer.push('<!--[-->');

						Transform($$renderer, $.spread_props([
							transform,
							{
								children: ($$renderer) => {
									if (T.Mesh) {
										$$renderer.push('<!--[-->');

										T.Mesh($$renderer, {
											frustumCulled: false,
											children: ($$renderer) => {
												if ($.store_get($$store_subs ??= {}, '$cubeGeometry', cubeGeometry)) {
													$$renderer.push('<!--[0-->');

													T($$renderer, {
														is: $.store_get($$store_subs ??= {}, '$cubeGeometry', cubeGeometry),
														dispose: false
													});
												} else {
													$$renderer.push('<!--[-1-->');
												}

												$$renderer.push(`<!--]--> `);

												{
													function children($$renderer, values) {
														DissolveMaterial($$renderer, {
															progress: values.values.progress,
															scale: values.values.noiseScale,
															transparent: true,
															roughness: 0.418,
															metalness: 0.6139,
															color: '#ff1f00',
															emissive: '#000105',
															children: ($$renderer) => {
																if (Sync) {
																	$$renderer.push('<!--[-->');

																	Sync($$renderer, {
																		color: true,
																		opacity: true,
																		emissive: true,
																		roughness: true,
																		metalness: true
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
															},
															$$slots: { default: true }
														});
													}

													if (Declare) {
														$$renderer.push('<!--[-->');

														Declare($$renderer, {
															props: { progress: 0, noiseScale: 1 },
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
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
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

		SheetObject($$renderer, { key, children, $$slots: { default: true } });
	}

	if ($$store_subs) $.unsubscribe_stores($$store_subs);
}