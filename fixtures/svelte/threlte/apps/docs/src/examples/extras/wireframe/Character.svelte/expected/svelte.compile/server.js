import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { useGltf, useGltfAnimations, Wireframe } from '@threlte/extras';

export default function Character($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { wireframeProps } = $$props;
		const gltf = useGltf('https://threejs.org/examples/models/gltf/Xbot.glb');
		let { actions } = useGltfAnimations(() => $.store_get($$store_subs ??= {}, '$gltf', gltf));

		if (T.Group) {
			$$renderer.push('<!--[-->');

			T.Group($$renderer, {
				dispose: false,
				children: ($$renderer) => {
					$.await($$renderer, gltf, () => {}, ({ nodes, materials }) => {
						T($$renderer, {
							is: nodes.Scene,
							children: ($$renderer) => {
								T($$renderer, {
									is: nodes.Armature,
									name: 'Armature',
									scale: 0.01,
									children: ($$renderer) => {
										T($$renderer, { is: nodes.mixamorigHips });
										$$renderer.push(`<!----> `);

										if (T.SkinnedMesh) {
											$$renderer.push('<!--[-->');

											T.SkinnedMesh($$renderer, {
												name: 'Beta_Joints',
												geometry: nodes.Beta_Joints.geometry,
												material: materials.Beta_Joints_MAT,
												skeleton: nodes.Beta_Joints.skeleton,
												castShadow: true
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
												name: 'Beta_Surface',
												geometry: nodes.Beta_Surface.geometry,
												material: materials['asdf1:Beta_HighLimbsGeoSG2'],
												skeleton: nodes.Beta_Surface.skeleton,
												castShadow: true,
												children: ($$renderer) => {
													Wireframe($$renderer, $.spread_props([wireframeProps]));
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
							},
							$$slots: { default: true }
						});
					});

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}