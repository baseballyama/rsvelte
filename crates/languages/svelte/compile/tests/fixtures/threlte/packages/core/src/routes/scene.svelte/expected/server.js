import * as $ from 'svelte/internal/server';
import { Color } from 'three';
import { injectPlugin, isInstanceOf, T, useThrelte } from '../lib/index.js';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { scene } = useThrelte();

		scene.background = new Color('black');

		let posY = 0;
		let makeDefault = false;
		let show = false;
		let height = 1;

		window.addEventListener('keydown', (e) => {
			if (e.key === ' ') {
				posY += 1;
			}

			if (e.key === 'Enter') {
				makeDefault = !makeDefault;
			}

			if (e.key === 's') {
				show = !show;
			}

			if (e.key === 'h') {
				height += 1;
			}
		});

		injectPlugin('test-plugin', (args) => {});

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');

			T.PerspectiveCamera($$renderer, {
				makeDefault,
				position: [10, 10, 10],
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

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, {
				children: ($$renderer) => {
					if (T.MeshBasicMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshBasicMaterial($$renderer, {});
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.Color) {
						$$renderer.push('<!--[-->');
						T.Color($$renderer, { args: ['blue'], attach: 'material.color' });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.BoxGeometry) {
						$$renderer.push('<!--[-->');

						T.BoxGeometry($$renderer, {
							children: ($$renderer) => {
								if (T.Mesh) {
									$$renderer.push('<!--[-->');

									T.Mesh($$renderer, {
										'position.y': posY,
										children: ($$renderer) => {
											if (T.MeshBasicMaterial) {
												$$renderer.push('<!--[-->');
												T.MeshBasicMaterial($$renderer, { color: 'blue' });
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

		$$renderer.push(` `);

		if (show) {
			$$renderer.push('<!--[0-->');

			if (T.Mesh) {
				$$renderer.push('<!--[-->');

				T.Mesh($$renderer, {
					children: ($$renderer) => {
						if (T.MeshBasicMaterial) {
							$$renderer.push('<!--[-->');
							T.MeshBasicMaterial($$renderer, {});
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (T.BoxGeometry) {
							$$renderer.push('<!--[-->');
							T.BoxGeometry($$renderer, { args: [1, height, 1] });
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
	});
}