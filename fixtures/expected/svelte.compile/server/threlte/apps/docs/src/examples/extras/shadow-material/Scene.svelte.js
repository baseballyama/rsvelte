import * as $ from 'svelte/internal/server';
import { Mesh } from 'three';
import { OrbitControls, ShadowMaterial } from '@threlte/extras';
import { T, useTask } from '@threlte/core';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { color = '#000000' } = $$props;
		const plane = new Mesh();
		const sphere = new Mesh();
		const radius = 1;
		const diameter = 2 * radius;
		const planeScale = 2 * diameter;

		plane.scale.x = planeScale;
		plane.scale.y = planeScale;

		let time = 0;
		const shadowMesh = new Mesh();

		useTask((dt) => {
			time += dt;

			const s = Math.sin(time);

			sphere.position.y = 2.5 + s;
			shadowMesh.scale.setScalar(3 + s);
		});

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');

			T.PerspectiveCamera($$renderer, {
				makeDefault: true,
				'position.x': 5,
				'position.y': 5,
				'position.z': 5,
				oncreate: (ref) => {
					ref.lookAt(plane.position);
				},

				children: ($$renderer) => {
					OrbitControls($$renderer, {});
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		T($$renderer, {
			is: sphere,
			children: ($$renderer) => {
				if (T.IcosahedronGeometry) {
					$$renderer.push('<!--[-->');
					T.IcosahedronGeometry($$renderer, { args: [radius, 2] });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (T.MeshBasicMaterial) {
					$$renderer.push('<!--[-->');
					T.MeshBasicMaterial($$renderer, { color: 'orangered', wireframe: true });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		if (T.Group) {
			$$renderer.push('<!--[-->');

			T.Group($$renderer, {
				'rotation.x': -1 * 0.5 * Math.PI,
				children: ($$renderer) => {
					T($$renderer, {
						is: plane,
						children: ($$renderer) => {
							if (T.PlaneGeometry) {
								$$renderer.push('<!--[-->');
								T.PlaneGeometry($$renderer, {});
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					T($$renderer, {
						is: shadowMesh,
						'position.z': 0.01,
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
							ShadowMaterial($$renderer, { color });
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
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