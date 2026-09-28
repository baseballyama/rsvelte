import * as $ from 'svelte/internal/server';
import { T, useTask } from '@threlte/core';
import { Float, useGltf } from '@threlte/extras';

export default function Suzanne($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let rotation = 0;

		useTask((dt) => {
			rotation += dt;
		});

		const gltf = useGltf('/models/Suzanne.glb');

		if (T.Group) {
			$$renderer.push('<!--[-->');

			T.Group($$renderer, {
				dispose: false,
				children: ($$renderer) => {
					$.await($$renderer, gltf, () => {}, (gltf) => {
						Float($$renderer, {
							floatIntensity: 10,
							speed: 2,
							floatingRange: [0.15, 0.4],
							children: ($$renderer) => {
								if (T.Mesh) {
									$$renderer.push('<!--[-->');

									T.Mesh($$renderer, {
										castShadow: true,
										receiveShadow: true,
										geometry: gltf.nodes.Suzanne.geometry,
										material: gltf.materials.Mat,
										'rotation.x': -0.62,
										'rotation.y': rotation
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
							floatIntensity: 8,
							seed: 1,
							speed: 3,
							floatingRange: [0.2, 0.6],
							position: [2.2, 0, -0.5],
							children: ($$renderer) => {
								if (T.Mesh) {
									$$renderer.push('<!--[-->');

									T.Mesh($$renderer, {
										castShadow: true,
										receiveShadow: true,
										geometry: gltf.nodes.Icosphere.geometry,
										material: gltf.materials.Mat,
										'rotation.x': -0.62,
										'rotation.y': 0.09 + rotation,
										'rotation.z': 1.4 + rotation / 2
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
							floatIntensity: 6,
							seed: 2,
							speed: 4,
							floatingRange: [0.2, 0.5],
							position: [-2.4, 0, 0.2],
							children: ($$renderer) => {
								if (T.Mesh) {
									$$renderer.push('<!--[-->');

									T.Mesh($$renderer, {
										castShadow: true,
										receiveShadow: true,
										geometry: gltf.nodes.Cylinder.geometry,
										material: gltf.materials.Mat
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

						if (T.Mesh) {
							$$renderer.push('<!--[-->');

							T.Mesh($$renderer, {
								receiveShadow: true,
								geometry: gltf.nodes.Floor.geometry,
								material: gltf.materials.Mat,
								position: [0, -0.1, 0]
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					});

					$$renderer.push(`<!--]-->`);
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