import * as $ from 'svelte/internal/server';
import { injectPlugin, isInstanceOf, T, useTask } from '@threlte/core';

import {
	Environment,
	Grid,
	interactivity,
	OrbitControls,
	TransformControls,
	VirtualEnvironment
} from '@threlte/extras';

import { DoubleSide } from 'three';

function lightformer($$renderer, color, size, position, visible) {
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
						if (T.CircleGeometry) {
							$$renderer.push('<!--[-->');
							T.CircleGeometry($$renderer, { args: [size / 2] });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

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
		let { debug, mixEnvironment } = $$props;

		interactivity();

		// lookAt plugin from the plugin examples
		injectPlugin('lookAt', (args) => {
			if (!isInstanceOf(args.ref, 'Object3D') || !args.props.lookAt) return;

			useTask(
				() => {
					if (!args.props.lookAt) return;

					args.ref.lookAt(args.props.lookAt[0], args.props.lookAt[1], args.props.lookAt[2]);
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
				'position.y': 2,
				children: ($$renderer) => {
					if (T.TorusGeometry) {
						$$renderer.push('<!--[-->');
						T.TorusGeometry($$renderer, {});
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshStandardMaterial($$renderer, { color: 'white', roughness: 0.4, metalness: 1 });
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
				if (mixEnvironment) {
					$$renderer.push('<!--[0-->');

					Environment($$renderer, {
						url: '/textures/equirectangular/hdr/mpumalanga_veld_puresky_1k.hdr',
						isBackground: true
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);
				lightformer($$renderer, '#FF4F4F', 20, [0, 0, -20], debug);
				$$renderer.push(`<!----> `);
				lightformer($$renderer, '#2223FF', 8, [-3, 0, 4], debug);
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}