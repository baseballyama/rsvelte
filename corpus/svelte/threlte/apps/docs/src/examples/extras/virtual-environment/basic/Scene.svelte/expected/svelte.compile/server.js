import * as $ from 'svelte/internal/server';
import { injectPlugin, isInstanceOf, T, useTask } from '@threlte/core';

import {
	Grid,
	interactivity,
	OrbitControls,
	TransformControls,
	VirtualEnvironment
} from '@threlte/extras';

import { DoubleSide } from 'three';

function lightformer($$renderer, color, shape, size, position, visible) {
	{
		function children($$renderer, { ref }) {
			if (visible) {
				$$renderer.push('<!--[0-->');
				TransformControls($$renderer, { object: ref });
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (T.Mesh) {
				$$renderer.push('<!--[-->');

				T.Mesh($$renderer, {
					lookAt: [0, 0, 0],
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
		let { debug } = $$props;

		interactivity();

		// lookAt plugin from the plugin examples
		injectPlugin('lookAt', (args) => {
			if (!isInstanceOf(args.ref, 'Object3D') || !args.props.lookAt) return;

			useTask(
				() => {
					if (!args.props.lookAt) return;

					args.ref.lookAt(...args.props.lookAt);
				},
				{ autoInvalidate: false }
			);

			return { pluginProps: ['lookAt'] };
		});

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

		VirtualEnvironment($$renderer, {
			visible: debug,
			children: ($$renderer) => {
				lightformer($$renderer, '#FF4F4F', 'plane', 20, [0, 0, -20], debug);
				$$renderer.push(`<!----> `);
				lightformer($$renderer, '#FFD0CB', 'circle', 5, [0, 5, 0], debug);
				$$renderer.push(`<!----> `);
				lightformer($$renderer, '#2223FF', 'plane', 8, [-3, 0, 4], debug);
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}