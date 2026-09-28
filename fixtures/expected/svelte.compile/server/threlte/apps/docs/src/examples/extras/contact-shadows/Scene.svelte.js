import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { ContactShadows, Environment, Float, OrbitControls } from '@threlte/extras';

import {
	BoxGeometry,
	Color,
	IcosahedronGeometry,
	MeshStandardMaterial,
	TorusKnotGeometry
} from 'three';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		Environment($$renderer, {
			url: '/textures/equirectangular/hdr/shanghai_riverside_1k.hdr'
		});

		$$renderer.push(`<!----> `);

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');

			T.PerspectiveCamera($$renderer, {
				makeDefault: true,
				position: [-10, 10, 10],
				fov: 25,
				children: ($$renderer) => {
					OrbitControls($$renderer, {
						enabled: false,
						autoRotate: true,
						autoRotateSpeed: 0.5,
						'target.y': 1
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

		if (T.DirectionalLight) {
			$$renderer.push('<!--[-->');
			T.DirectionalLight($$renderer, { intensity: 0.8, 'position.x': 5, 'position.y': 10 });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.AmbientLight) {
			$$renderer.push('<!--[-->');
			T.AmbientLight($$renderer, { intensity: 0.2 });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.GridHelper) {
			$$renderer.push('<!--[-->');
			T.GridHelper($$renderer, { args: [10, 10], 'position.y': -0.001 });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);
		ContactShadows($$renderer, { frames: 200, scale: 10, blur: 2, far: 2.5, opacity: 0.5 });
		$$renderer.push(`<!----> `);

		Float($$renderer, {
			floatIntensity: 1,
			floatingRange: [0, 1],
			children: ($$renderer) => {
				if (T.Mesh) {
					$$renderer.push('<!--[-->');

					T.Mesh($$renderer, {
						'position.y': 1.2,
						'position.z': -0.75,
						geometry: new BoxGeometry(1, 1, 1),
						material: new MeshStandardMaterial({ color: new Color('#0059BA') })
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
			floatingRange: [0, 1],
			children: ($$renderer) => {
				if (T.Mesh) {
					$$renderer.push('<!--[-->');

					T.Mesh($$renderer, {
						position: [1.2, 1.5, 0.75],
						'rotation.x': 5,
						'rotation.y': 71,
						geometry: new TorusKnotGeometry(0.5, 0.15, 100, 12, 2, 3),
						material: new MeshStandardMaterial({ color: new Color('#F85122') })
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
			floatingRange: [0, 1],
			children: ($$renderer) => {
				if (T.Mesh) {
					$$renderer.push('<!--[-->');

					T.Mesh($$renderer, {
						position: [-1.4, 1.5, 0.75],
						rotation: [-5, 128, 10],
						geometry: new IcosahedronGeometry(1, 0),
						material: new MeshStandardMaterial({ color: new Color('#F8EBCE') })
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
	});
}