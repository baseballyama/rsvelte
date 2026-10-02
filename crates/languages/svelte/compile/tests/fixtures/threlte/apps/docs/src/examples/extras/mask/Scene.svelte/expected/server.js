import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { OrbitControls, Grid, Float, TransformControls, Mask, useMask } from '@threlte/extras';
import { Pane, Checkbox, List } from 'svelte-tweakpane-ui';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let inverse = true;
		let move = false;
		let id = 1;
		const torusStencil = $.derived(() => useMask(1, inverse));
		const boxStencil = $.derived(() => useMask(2, inverse));
		const icoStencil = $.derived(() => useMask(3, inverse));
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Pane($$renderer, {
				title: 'Mask',
				position: 'fixed',
				children: ($$renderer) => {
					Checkbox($$renderer, {
						label: 'inverse',
						get value() {
							return inverse;
						},

						set value($$value) {
							inverse = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					List($$renderer, {
						label: 'target',
						options: { torus: 1, box: 2, ico: 3 },
						get value() {
							return id;
						},

						set value($$value) {
							id = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Checkbox($$renderer, {
						label: 'move',
						get value() {
							return move;
						},

						set value($$value) {
							move = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			if (T.PerspectiveCamera) {
				$$renderer.push('<!--[-->');

				T.PerspectiveCamera($$renderer, {
					makeDefault: true,
					position: [3, 4, 15],
					fov: 15,
					children: ($$renderer) => {
						OrbitControls($$renderer, { enableDamping: true, target: [0, 0.5, 0] });
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			{
				function children($$renderer, { ref }) {
					Mask($$renderer, {
						id,
						children: ($$renderer) => {
							if (T.CircleGeometry) {
								$$renderer.push('<!--[-->');
								T.CircleGeometry($$renderer, { args: [0.65] });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (T.MeshBasicMaterial) {
								$$renderer.push('<!--[-->');
								T.MeshBasicMaterial($$renderer, {});
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					if (T.Mesh) {
						$$renderer.push('<!--[-->');

						T.Mesh($$renderer, {
							children: ($$renderer) => {
								if (T.RingGeometry) {
									$$renderer.push('<!--[-->');
									T.RingGeometry($$renderer, { args: [0.6, 0.7, 50] });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (T.MeshBasicMaterial) {
									$$renderer.push('<!--[-->');
									T.MeshBasicMaterial($$renderer, {});
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

					if (move) {
						$$renderer.push('<!--[0-->');
						TransformControls($$renderer, { object: ref, showZ: false });
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				}

				if (T.Group) {
					$$renderer.push('<!--[-->');
					T.Group($$renderer, { position: [0, 1, 2], children, $$slots: { default: true } });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			$$renderer.push(` `);

			if (T.DirectionalLight) {
				$$renderer.push('<!--[-->');
				T.DirectionalLight($$renderer, { intensity: 3, 'position.x': 5, 'position.y': 10 });
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

			Grid($$renderer, {
				gridSize: [8, 8],
				cellColor: '#46536b',
				'position.y': -0.3,
				sectionThickness: 0,
				fadeDistance: 50
			});

			$$renderer.push(`<!----> `);

			Float($$renderer, {
				floatIntensity: 1,
				floatingRange: [0, 1],
				children: ($$renderer) => {
					if (T.Mesh) {
						$$renderer.push('<!--[-->');

						T.Mesh($$renderer, {
							position: [0, 0.3, 0],
							children: ($$renderer) => {
								if (T.TorusKnotGeometry) {
									$$renderer.push('<!--[-->');
									T.TorusKnotGeometry($$renderer, { args: [0.5, 0.15, 100, 12, 2, 3] });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (T.MeshStandardMaterial) {
									$$renderer.push('<!--[-->');
									T.MeshStandardMaterial($$renderer, $.spread_props([{ color: '#F85122' }, torusStencil()]));
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

			$$renderer.push(`<!----> `);

			Float($$renderer, {
				floatIntensity: 1,
				floatingRange: [0, 0.5],
				children: ($$renderer) => {
					if (T.Mesh) {
						$$renderer.push('<!--[-->');

						T.Mesh($$renderer, {
							'position.y': 0.5,
							position: [-1.5, 0, -2],
							children: ($$renderer) => {
								if (T.BoxGeometry) {
									$$renderer.push('<!--[-->');
									T.BoxGeometry($$renderer, {});
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (T.MeshStandardMaterial) {
									$$renderer.push('<!--[-->');
									T.MeshStandardMaterial($$renderer, $.spread_props([{ color: '#0059BA' }, boxStencil()]));
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

			$$renderer.push(`<!----> `);

			Float($$renderer, {
				floatIntensity: 1,
				floatingRange: [0, 0.5],
				children: ($$renderer) => {
					if (T.Mesh) {
						$$renderer.push('<!--[-->');

						T.Mesh($$renderer, {
							position: [1.5, 0.3, -2],
							scale: 0.8,
							children: ($$renderer) => {
								if (T.IcosahedronGeometry) {
									$$renderer.push('<!--[-->');
									T.IcosahedronGeometry($$renderer, {});
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (T.MeshStandardMaterial) {
									$$renderer.push('<!--[-->');
									T.MeshStandardMaterial($$renderer, $.spread_props([{ color: '#F8EBCE' }, icoStencil()]));
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

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}