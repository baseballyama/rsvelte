import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { useGltf, InstancedMeshes, useDraco } from '@threlte/extras';

export default function Ducks($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { fallback } = $$props;
		const dracoLoader = useDraco();
		const gltf = useGltf('/models/duck_floaty-transformed.glb', { dracoLoader });
		const duckSpread = 200;

		if (T.Group) {
			$$renderer.push('<!--[-->');

			T.Group($$renderer, {
				dispose: false,
				frustumCulled: false,
				children: ($$renderer) => {
					$.await(
						$$renderer,
						gltf,
						() => {
							fallback?.($$renderer);
							$$renderer.push(`<!---->`);
						},
						(gltf) => {
							{
								function children($$renderer, { components: { Object_4, Object_6 } }) {
									$$renderer.push(`<!--[-->`);

									const each_array = $.ensure_array_like({ length: 200 });

									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
										let _ = each_array[$$index];
										const posX = Math.random() * duckSpread - duckSpread / 2;
										const posZ = Math.random() * duckSpread - 300;

										if (T.Group) {
											$$renderer.push('<!--[-->');

											T.Group($$renderer, {
												'position.x': posX,
												'position.z': posZ,
												scale: 0.1,
												children: ($$renderer) => {
													if (Object_4) {
														$$renderer.push('<!--[-->');
														Object_4($$renderer, { position: [0, 1.59, 2.54], scale: 0.43 });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Object_6) {
														$$renderer.push('<!--[-->');
														Object_6($$renderer, { position: [0, -0.03, 0] });
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

									$$renderer.push(`<!--]-->`);
								}

								InstancedMeshes($$renderer, { meshes: gltf.nodes, children, $$slots: { default: true } });
							}
						}
					);

					$$renderer.push(`<!--]-->`);
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