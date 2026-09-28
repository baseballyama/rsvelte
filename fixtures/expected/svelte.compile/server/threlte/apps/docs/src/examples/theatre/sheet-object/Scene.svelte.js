import * as $ from 'svelte/internal/server';
import { MathUtils } from 'three';
import { T } from '@threlte/core';
import { RoundedBoxGeometry, interactivity, useCursor } from '@threlte/extras';
import { SheetObject } from '@threlte/theatre';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		interactivity();

		const { onPointerEnter, onPointerLeave } = useCursor();

		{
			function children($$renderer, { Sync, Transform }) {
				if (Transform) {
					$$renderer.push('<!--[-->');

					Transform($$renderer, {
						children: ($$renderer) => {
							if (T.DirectionalLight) {
								$$renderer.push('<!--[-->');

								T.DirectionalLight($$renderer, {
									castShadow: true,
									children: ($$renderer) => {
										if (Sync) {
											$$renderer.push('<!--[-->');
											Sync($$renderer, { intensity: true, color: true });
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

			SheetObject($$renderer, {
				key: 'Directional Light',
				children,
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!----> `);

		{
			function children($$renderer, { Sync }) {
				if (T.AmbientLight) {
					$$renderer.push('<!--[-->');

					T.AmbientLight($$renderer, {
						children: ($$renderer) => {
							if (Sync) {
								$$renderer.push('<!--[-->');
								Sync($$renderer, { intensity: true, color: true });
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

			SheetObject($$renderer, { key: 'Ambient Light', children, $$slots: { default: true } });
		}

		$$renderer.push(`<!----> `);

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');

			T.PerspectiveCamera($$renderer, {
				makeDefault: true,
				position: [5, 5, 5],
				oncreate: (ref) => {
					ref.lookAt(0, 0, 0);
				}
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		{
			function children($$renderer, { Sync, Transform, select, deselect }) {
				if (Transform) {
					$$renderer.push('<!--[-->');

					Transform($$renderer, {
						children: ($$renderer) => {
							if (T.Mesh) {
								$$renderer.push('<!--[-->');

								T.Mesh($$renderer, {
									castShadow: true,
									onclick: select,
									onpointerenter: onPointerEnter,
									onpointerleave: onPointerLeave,
									onpointermissed: deselect,
									children: ($$renderer) => {
										RoundedBoxGeometry($$renderer, { radius: 0.1 });
										$$renderer.push(`<!----> `);

										{
											function children($$renderer, { ref }) {
												if (Sync) {
													$$renderer.push('<!--[-->');

													Sync($$renderer, {
														type: ref,
														color: true,
														roughness: true,
														metalness: true,
														side: true,
														opacity: true
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											}

											if (T.MeshStandardMaterial) {
												$$renderer.push('<!--[-->');
												T.MeshStandardMaterial($$renderer, { transparent: true, children, $$slots: { default: true } });
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
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			SheetObject($$renderer, { key: 'Box', children, $$slots: { default: true } });
		}

		$$renderer.push(`<!----> `);

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, {
				receiveShadow: true,
				'position.y': -1,
				'rotation.x': -90 * MathUtils.DEG2RAD,
				children: ($$renderer) => {
					if (T.CircleGeometry) {
						$$renderer.push('<!--[-->');
						T.CircleGeometry($$renderer, { args: [1.4, 48] });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshStandardMaterial($$renderer, {});
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
}