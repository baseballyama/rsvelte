import * as $ from 'svelte/internal/server';
import SliceMaterial from './SliceMaterial.svelte';
import { DoubleSide, Group } from 'three/webgpu';
import { Environment, OrbitControls, useDraco, useGltf } from '@threlte/extras';
import { T, useTask, useThrelte } from '@threlte/core';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { arcAngle, rotate, sliceColor, startAngle } = $$props;
		const dracoLoader = useDraco();
		const gltf = useGltf('/models/gears.glb', { dracoLoader });
		const { scene } = useThrelte();

		scene.backgroundBlurriness = 0.5;

		let rotation = 0;

		useTask(
			(delta) => {
				rotation += 0.1 * delta;
			},
			{ running: () => rotate }
		);

		const metalness = 0.5;
		const roughness = 0.25;
		const envMapIntensity = 0.5;
		const color = '#858080';
		const group = new Group();

		function mesh($$renderer, mesh) {
			T($$renderer, {
				is: mesh,
				castShadow: true,
				receiveShadow: true,
				children: ($$renderer) => {
					if (T.MeshPhysicalMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshPhysicalMaterial($$renderer, { metalness, roughness, envMapIntensity, color });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				$$slots: { default: true }
			});
		}

		Environment($$renderer, {
			url: '/textures/equirectangular/hdr/aerodynamics_workshop_1k.hdr',
			isBackground: true
		});

		$$renderer.push(`<!----> `);

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');

			T.PerspectiveCamera($$renderer, {
				makeDefault: true,
				'position.x': -5,
				'position.y': 5,
				'position.z': 12,
				children: ($$renderer) => {
					OrbitControls($$renderer, { enableDamping: true });
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

			T.DirectionalLight($$renderer, {
				castShadow: true,
				intensity: 4,
				'position.x': 6.25,
				'position.y': 3,
				'position.z': 4,
				'shadow.camera.near': 0.1,
				'shadow.camera.bottom': -8,
				'shadow.camera.far': 30,
				'shadow.camera.left': -8,
				'shadow.camera.normalBias': 0.05,
				'shadow.camera.right': 8,
				'shadow.camera.top': 8,
				'shadow.mapSize.x': 2048,
				'shadow.mapSize.y': 2048
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		T($$renderer, {
			is: group,
			'rotation.y': rotation,
			children: ($$renderer) => {
				$.await($$renderer, gltf, () => {}, ({ nodes }) => {
					mesh($$renderer, nodes.axle);
					$$renderer.push(`<!----> `);
					mesh($$renderer, nodes.gears);
					$$renderer.push(`<!----> `);

					T($$renderer, {
						is: nodes.outerHull,
						castShadow: true,
						receiveShadow: true,
						children: ($$renderer) => {
							SliceMaterial($$renderer, {
								arcAngle,
								startAngle,
								sliceColor,
								metalness,
								roughness,
								envMapIntensity,
								color,
								side: DoubleSide
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				});

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, {
				'position.x': -4,
				'position.y': -3,
				'position.z': -4,
				oncreate: (ref) => {
					ref.lookAt(group.position);
				},
				scale: 10,
				receiveShadow: true,
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

					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshStandardMaterial($$renderer, { color: 0xaa_aa_aa });
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
	});
}