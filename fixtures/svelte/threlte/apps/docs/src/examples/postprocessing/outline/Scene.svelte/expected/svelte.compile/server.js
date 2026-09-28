import * as $ from 'svelte/internal/server';
import { DoubleSide } from 'three';
import { Environment, OrbitControls } from '@threlte/extras';
import { T, useTask } from '@threlte/core';
import { Tween } from 'svelte/motion';
import { quadInOut } from 'svelte/easing';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { mesh, positions = [], play = true, walls = [] } = $$props;
		let positionIndex = 0;
		const positionTween = new Tween(positions[positionIndex], { duration: 400, easing: quadInOut });
		let time = 0;

		// if `positions` changes, restart
		useTask(
			(delta) => {
				time += delta;

				if (time > 0.5) {
					positionIndex += 1;
					positionIndex %= positions.length;
					positionTween.set(positions[positionIndex]);
					time = 0;
				}
			},
			{ running: () => play }
		);

		const extrudeOptions = { bevelEnabled: false };

		Environment($$renderer, {
			url: '/textures/equirectangular/hdr/shanghai_riverside_1k.hdr'
		});

		$$renderer.push(`<!----> `);

		if (T.OrthographicCamera) {
			$$renderer.push('<!--[-->');

			T.OrthographicCamera($$renderer, {
				makeDefault: true,
				position: [10, 10, 10],
				zoom: 50,
				children: ($$renderer) => {
					OrbitControls($$renderer, { enableDamping: true });
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
				'rotation.x': -1 * 0.5 * Math.PI,
				children: ($$renderer) => {
					$$renderer.push(`<!--[-->`);

					const each_array = $.ensure_array_like(walls);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let { height, shape } = each_array[$$index];

						if (T.Mesh) {
							$$renderer.push('<!--[-->');

							T.Mesh($$renderer, {
								'scale.z': height,
								children: ($$renderer) => {
									if (T.ExtrudeGeometry) {
										$$renderer.push('<!--[-->');
										T.ExtrudeGeometry($$renderer, { args: [shape, extrudeOptions] });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (T.MeshStandardMaterial) {
										$$renderer.push('<!--[-->');
										T.MeshStandardMaterial($$renderer, { color: 'silver' });
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

					$$renderer.push(`<!--]--> `);

					if (T.Group) {
						$$renderer.push('<!--[-->');

						T.Group($$renderer, {
							position: positionTween.current ?? positions[0] ?? [0, 0, 0],
							children: ($$renderer) => {
								T($$renderer, {
									is: mesh,
									children: ($$renderer) => {
										if (T.MeshStandardMaterial) {
											$$renderer.push('<!--[-->');
											T.MeshStandardMaterial($$renderer, { color: 'gold' });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (T.BoxGeometry) {
											$$renderer.push('<!--[-->');
											T.BoxGeometry($$renderer, {});
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

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.Mesh) {
						$$renderer.push('<!--[-->');

						T.Mesh($$renderer, {
							scale: 100,
							'position.z': -1.01,
							children: ($$renderer) => {
								if (T.PlaneGeometry) {
									$$renderer.push('<!--[-->');
									T.PlaneGeometry($$renderer, {});
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (T.MeshStandardMaterial) {
									$$renderer.push('<!--[-->');
									T.MeshStandardMaterial($$renderer, { color: 'green', side: DoubleSide });
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
	});
}