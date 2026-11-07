import * as $ from 'svelte/internal/server';
import { Group } from 'three';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { T } from '@threlte/core';
import { useGltf, useGltfAnimations } from '@threlte/extras';

export default function Robot($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			fallback,
			error,
			children,
			action,
			ref = void 0,
			$$slots,
			$$events,
			...props
		} = $$props;

		ref = new Group();

		const gltf = useGltf('/models/RobotExpressive.glb');

		function cloneScene(scene) {
			const clone = cloneSkeleton(scene);
			const nodes = {};

			clone.traverse((child) => {
				if (child.name) nodes[child.name] = child;
			});

			return nodes;
		}

		const { actions, mixer } = useGltfAnimations(() => $.store_get($$store_subs ??= {}, '$gltf', gltf), () => ref);

		T($$renderer, $.spread_props([
			{ is: ref, dispose: false },
			props,
			{
				children: ($$renderer) => {
					$.await(
						$$renderer,
						gltf,
						() => {
							fallback?.($$renderer);
							$$renderer.push(`<!---->`);
						},
						(gltf) => {
							const clonedNodes = cloneScene(gltf.scene);

							if (T.Group) {
								$$renderer.push('<!--[-->');

								T.Group($$renderer, {
									name: 'Root_Scene',
									children: ($$renderer) => {
										if (T.Group) {
											$$renderer.push('<!--[-->');

											T.Group($$renderer, {
												name: 'RootNode',
												children: ($$renderer) => {
													if (T.Group) {
														$$renderer.push('<!--[-->');

														T.Group($$renderer, {
															name: 'RobotArmature',
															rotation: [-Math.PI / 2, 0, 0],
															scale: 100,
															children: ($$renderer) => {
																T($$renderer, { is: clonedNodes.Bone });
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
															name: 'HandR',
															position: [0, 2.37, -0.02],
															rotation: [-Math.PI / 2, 0, 0],
															scale: 100,
															children: ($$renderer) => {
																if (T.SkinnedMesh) {
																	$$renderer.push('<!--[-->');

																	T.SkinnedMesh($$renderer, {
																		name: 'HandR_1',
																		geometry: gltf.nodes.HandR_1.geometry,
																		material: gltf.materials.Main,
																		skeleton: clonedNodes.HandR_1.skeleton
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (T.SkinnedMesh) {
																	$$renderer.push('<!--[-->');

																	T.SkinnedMesh($$renderer, {
																		name: 'HandR_2',
																		geometry: gltf.nodes.HandR_2.geometry,
																		material: gltf.materials.Grey,
																		skeleton: clonedNodes.HandR_2.skeleton
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

													if (T.Group) {
														$$renderer.push('<!--[-->');

														T.Group($$renderer, {
															name: 'HandL',
															position: [0, 2.37, -0.02],
															rotation: [-Math.PI / 2, 0, 0],
															scale: 100,
															children: ($$renderer) => {
																if (T.SkinnedMesh) {
																	$$renderer.push('<!--[-->');

																	T.SkinnedMesh($$renderer, {
																		name: 'HandL_1',
																		geometry: gltf.nodes.HandL_1.geometry,
																		material: gltf.materials.Main,
																		skeleton: clonedNodes.HandL_1.skeleton
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (T.SkinnedMesh) {
																	$$renderer.push('<!--[-->');

																	T.SkinnedMesh($$renderer, {
																		name: 'HandL_2',
																		geometry: gltf.nodes.HandL_2.geometry,
																		material: gltf.materials.Grey,
																		skeleton: clonedNodes.HandL_2.skeleton
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
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}
					);

					$$renderer.push(`<!--]--> `);
					children?.($$renderer, { ref });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			}
		]));

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { ref, actions, mixer });
	});
}