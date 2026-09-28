import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';

import {
	Grid,
	interactivity,
	OrbitControls,
	TransformControls,
	VirtualEnvironment
} from '@threlte/extras';

import { Checkbox, Pane } from 'svelte-tweakpane-ui';
import { DoubleSide } from 'three';
import RenderIndicator from './RenderIndicator.svelte';

function lightformer($$renderer, update, color, shape, size, position, visible) {
	{
		function children($$renderer, { ref }) {
			const lookAtCenter = () => ref.lookAt(0, 0, 0);

			if (visible) {
				$$renderer.push('<!--[0-->');

				TransformControls($$renderer, {
					object: ref,
					oncreate: lookAtCenter,
					onobjectChange: () => {
						lookAtCenter();
						update();
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (T.Mesh) {
				$$renderer.push('<!--[-->');

				T.Mesh($$renderer, {
					children: ($$renderer) => {
						if (shape === 'circle') {
							$$renderer.push('<!--[0-->');

							if (T.CircleGeometry) {
								$$renderer.push('<!--[-->');
								T.CircleGeometry($$renderer, { args: [size / 2] });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						} else {
							$$renderer.push('<!--[-1-->');

							if (T.PlaneGeometry) {
								$$renderer.push('<!--[-->');
								T.PlaneGeometry($$renderer, { args: [size, size] });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(`<!--]--> `);

						if (T.MeshBasicMaterial) {
							$$renderer.push('<!--[-->');
							T.MeshBasicMaterial($$renderer, { color, side: DoubleSide });
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

		if (T.Group) {
			$$renderer.push('<!--[-->');
			T.Group($$renderer, { position, children, $$slots: { default: true } });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	}
}

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let debug = true;

		interactivity();

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Pane($$renderer, {
				position: 'fixed',
				title: 'Render Indicator',
				children: ($$renderer) => {
					Checkbox($$renderer, {
						label: 'debug',
						get value() {
							return debug;
						},

						set value($$value) {
							debug = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);
					RenderIndicator($$renderer, {});
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			if (T.PerspectiveCamera) {
				$$renderer.push('<!--[-->');

				T.PerspectiveCamera($$renderer, {
					makeDefault: true,
					position: [10, 10, 10],
					children: ($$renderer) => {
						OrbitControls($$renderer, {
							autoRotate: !debug,
							autoRotateSpeed: 0.15,
							enableDamping: true
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
			Grid($$renderer, { cellColor: 'white', sectionColor: 'white' });
			$$renderer.push(`<!----> `);

			if (T.Mesh) {
				$$renderer.push('<!--[-->');

				T.Mesh($$renderer, {
					'position.y': 1,
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
							T.MeshStandardMaterial($$renderer, { color: 'white', roughness: 0.15 });
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

			{
				function children($$renderer, { update }) {
					if (T.Group) {
						$$renderer.push('<!--[-->');

						T.Group($$renderer, {
							oncreate: () => {
								update();
							},

							children: ($$renderer) => {
								lightformer($$renderer, update, '#FF4F4F', 'plane', 20, [0, 0, -20], debug);
								$$renderer.push(`<!----> `);
								lightformer($$renderer, update, '#FFD0CB', 'circle', 5, [0, 5, 0], debug);
								$$renderer.push(`<!----> `);
								lightformer($$renderer, update, '#2223FF', 'plane', 8, [-3, 0, 4], debug);
								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}

				VirtualEnvironment($$renderer, {
					frames: 0,
					visible: debug,
					children,
					$$slots: { default: true }
				});
			}

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