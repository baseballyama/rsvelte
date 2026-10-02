import * as $ from 'svelte/internal/server';
import { CubeCamera, Environment, Grid, OrbitControls } from '@threlte/extras';
import { EquirectangularReflectionMapping } from 'three';
import { RGBELoader } from 'three/examples/jsm/Addons.js';
import { T, useLoader, useTask } from '@threlte/core';

export const hdrs = {
	industrial: 'industrial_sunset_puresky_1k.hdr',
	workshop: 'aerodynamics_workshop_1k.hdr',
	puresky: 'mpumalanga_veld_puresky_1k.hdr'
};

const isHdrKey = (u) => {
	return u in hdrs;
};

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			frames = Infinity,
			hdr = 'auto',
			metalness = 1,
			near = 0.1,
			far = 1000,
			resolution = 256,
			roughness = 0
		} = $$props;

		const colors = ['#ff00ff', '#ffff00', '#00ffff'];
		const increment = 2 * Math.PI / colors.length;
		const radius = 3;
		let time = 0;
		const groups = [];

		useTask((delta) => {
			time += delta;

			let i = 0;

			for (const group of groups) {
				group.position.setY(2 * Math.sin(time + i));
				i += 1;
			}
		});

		const hdrPath = '/textures/equirectangular/hdr/';

		const loader = useLoader(RGBELoader, {
			extend(loader) {
				loader.setPath(hdrPath);
			}
		});

		const backgrounds = loader.load(hdrs, {
			transform(texture) {
				texture.mapping = EquirectangularReflectionMapping;

				return texture;
			}
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (T.PerspectiveCamera) {
				$$renderer.push('<!--[-->');
				T.PerspectiveCamera($$renderer, { makeDefault: true, position: [8, 5, 8] });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);
			OrbitControls($$renderer, { enableDamping: true, enablePan: false, enableZoom: false });
			$$renderer.push(`<!----> `);
			Environment($$renderer, { url: `${hdrPath}shanghai_riverside_1k.hdr` });
			$$renderer.push(`<!----> `);
			Grid($$renderer, { 'position.y': -3, sectionColor: '#fff', cellColor: '#fff' });
			$$renderer.push(`<!----> `);

			$.await($$renderer, backgrounds, () => {}, (backgroundMap) => {
				const background = isHdrKey(hdr) ? backgroundMap[hdr] : hdr;

				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(colors);

				for (let index = 0, $$length = each_array.length; index < $$length; index++) {
					let color = each_array[index];
					const x = increment * index;
					const y = Math.PI + x;

					if (T.Mesh) {
						$$renderer.push('<!--[-->');

						T.Mesh($$renderer, {
							'position.x': radius * Math.cos(x),
							'position.y': index,
							'position.z': radius * Math.sin(x),
							children: ($$renderer) => {
								if (T.MeshStandardMaterial) {
									$$renderer.push('<!--[-->');
									T.MeshStandardMaterial($$renderer, { color });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (T.SphereGeometry) {
									$$renderer.push('<!--[-->');
									T.SphereGeometry($$renderer, {});
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
							'position.x': radius * Math.cos(y),
							'position.z': radius * Math.sin(y),
							get ref() {
								return groups[index];
							},

							set ref($$value) {
								groups[index] = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								{
									function children($$renderer, { renderTarget }) {
										if (T.Mesh) {
											$$renderer.push('<!--[-->');

											T.Mesh($$renderer, {
												children: ($$renderer) => {
													if (T.SphereGeometry) {
														$$renderer.push('<!--[-->');
														T.SphereGeometry($$renderer, {});
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (T.MeshStandardMaterial) {
														$$renderer.push('<!--[-->');
														T.MeshStandardMaterial($$renderer, { roughness, metalness, envMap: renderTarget.texture });
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

									CubeCamera($$renderer, {
										background,
										frames,
										near,
										far,
										resolution,
										children,
										$$slots: { default: true }
									});
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
			});

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}