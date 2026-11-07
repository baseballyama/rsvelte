import * as $ from 'svelte/internal/server';
import { T, useTask, useThrelte } from '@threlte/core';
import { Float, OrbitControls, HUD } from '@threlte/extras';
import { Quaternion } from 'three';
import HudScene from './HudScene.svelte';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let selected = 'box';
		let rotation = 0;
		const quaternion = new Quaternion();
		const { camera } = useThrelte();

		useTask(
			(delta) => {
				rotation += delta;

				// Spin mesh to the inverse of the default cameras matrix
				quaternion.copy(camera.current.quaternion).invert();
			},
			{ autoInvalidate: false }
		);

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');

			T.PerspectiveCamera($$renderer, {
				position: [11, 5, 11],
				makeDefault: true,
				fov: 30,
				children: ($$renderer) => {
					OrbitControls($$renderer, { enableZoom: false });
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.DirectionalLight) {
			$$renderer.push('<!--[-->');
			T.DirectionalLight($$renderer, { position: [0, 10, 10] });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.AmbientLight) {
			$$renderer.push('<!--[-->');
			T.AmbientLight($$renderer, { intensity: 0.6 });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.GridHelper) {
			$$renderer.push('<!--[-->');
			T.GridHelper($$renderer, { args: [5] });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		HUD($$renderer, {
			children: ($$renderer) => {
				HudScene($$renderer, {
					quaternion,
					onselect: (arg) => {
						selected = arg;
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Float($$renderer, {
			speed: 8,
			'rotation.y': rotation,
			children: ($$renderer) => {
				if (selected === 'box') {
					$$renderer.push('<!--[0-->');

					if (T.Mesh) {
						$$renderer.push('<!--[-->');

						T.Mesh($$renderer, {
							'position.y': 0.8,
							scale: 2,
							children: ($$renderer) => {
								if (T.BoxGeometry) {
									$$renderer.push('<!--[-->');
									T.BoxGeometry($$renderer, { args: [0.5, 0.5, 0.5] });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (T.MeshToonMaterial) {
									$$renderer.push('<!--[-->');
									T.MeshToonMaterial($$renderer, { color: 'turquoise' });
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
				} else if (selected === 'torus') {
					$$renderer.push('<!--[1-->');

					if (T.Mesh) {
						$$renderer.push('<!--[-->');

						T.Mesh($$renderer, {
							'position.y': 0.8,
							scale: 1.8,
							children: ($$renderer) => {
								if (T.TorusGeometry) {
									$$renderer.push('<!--[-->');
									T.TorusGeometry($$renderer, { args: [0.25, 0.1] });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (T.MeshToonMaterial) {
									$$renderer.push('<!--[-->');
									T.MeshToonMaterial($$renderer, { color: 'turquoise' });
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
				} else if (selected === 'torusknot') {
					$$renderer.push('<!--[2-->');

					if (T.Mesh) {
						$$renderer.push('<!--[-->');

						T.Mesh($$renderer, {
							'position.y': 0.8,
							scale: 1.8,
							children: ($$renderer) => {
								if (T.TorusKnotGeometry) {
									$$renderer.push('<!--[-->');
									T.TorusKnotGeometry($$renderer, { args: [0.215, 0.08, 256] });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (T.MeshToonMaterial) {
									$$renderer.push('<!--[-->');
									T.MeshToonMaterial($$renderer, { color: 'turquoise' });
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
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}