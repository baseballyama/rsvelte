import * as $ from 'svelte/internal/server';
import FallingShapes from './FallingShapes.svelte';
import RAPIER from '@dimforge/rapier3d-compat';
import { Collider, Debug, RigidBody } from '@threlte/rapier';
import { DoubleSide, PlaneGeometry, MathUtils } from 'three';
import { Environment, OrbitControls, Suspense } from '@threlte/extras';
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise.js';
import { T } from '@threlte/core';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { resetCounter = 0, showDebug = false } = $$props;
		const nsubdivs = 10;
		const size = 10;
		const heights = [];
		const geometry = new PlaneGeometry(size, size, nsubdivs, nsubdivs);
		const noise = new SimplexNoise();
		const positions = geometry.getAttribute('position').array;

		for (let x = 0; x <= nsubdivs; x++) {
			for (let y = 0; y <= nsubdivs; y++) {
				const height = noise.noise(x / 4, y / 4);
				const vertIndex = (x + (nsubdivs + 1) * y) * 3;

				positions[vertIndex + 2] = height;

				const heightIndex = y + (nsubdivs + 1) * x;

				heights[heightIndex] = height;
			}
		}

		// needed for lighting
		geometry.computeVertexNormals();

		const scale = new RAPIER.Vector3(size, 1, size);

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');

			T.PerspectiveCamera($$renderer, {
				makeDefault: true,
				'position.y': 10,
				'position.z': 10,
				children: ($$renderer) => {
					OrbitControls($$renderer, { enableDamping: true, enableZoom: false });
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		Suspense($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->`);

				{
					{
						function children($$renderer, { shape }) {
							if (T.Mesh) {
								$$renderer.push('<!--[-->');

								T.Mesh($$renderer, {
									castShadow: true,
									receiveShadow: true,
									geometry: shape.geometry,
									children: ($$renderer) => {
										if (T.MeshStandardMaterial) {
											$$renderer.push('<!--[-->');
											T.MeshStandardMaterial($$renderer, { color: shape.color });
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

						FallingShapes($$renderer, { children, $$slots: { default: true } });
					}
				}

				$$renderer.push(`<!----> `);

				Environment($$renderer, {
					url: '/textures/equirectangular/hdr/shanghai_riverside_1k.hdr'
				});

				$$renderer.push(`<!----> `);

				if (T.DirectionalLight) {
					$$renderer.push('<!--[-->');
					T.DirectionalLight($$renderer, { castShadow: true, position: [5, 5, 5] });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (T.Mesh) {
					$$renderer.push('<!--[-->');

					T.Mesh($$renderer, {
						receiveShadow: true,
						geometry,
						'rotation.x': MathUtils.DEG2RAD * -90,
						children: ($$renderer) => {
							if (T.MeshStandardMaterial) {
								$$renderer.push('<!--[-->');

								T.MeshStandardMaterial($$renderer, {
									color: 'teal',
									opacity: 0.8,
									transparent: true,
									side: DoubleSide
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

				RigidBody($$renderer, {
					type: 'fixed',
					children: ($$renderer) => {
						Collider($$renderer, {
							shape: 'heightfield',
							args: [nsubdivs, nsubdivs, new Float32Array(heights), scale]
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				if (showDebug) {
					$$renderer.push('<!--[0-->');
					Debug($$renderer, {});
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