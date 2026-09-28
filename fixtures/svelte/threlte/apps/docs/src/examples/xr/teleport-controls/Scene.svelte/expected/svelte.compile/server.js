import * as $ from 'svelte/internal/server';
import Surfaces from './Surfaces.svelte';
import { OrbitControls, Sky, useDraco, useGltf } from '@threlte/extras';
import { PointLight } from 'three';
import { SimplexNoise } from 'three/examples/jsm/Addons.js';
import { T, useTask } from '@threlte/core';
import { XR, Controller, Hand } from '@threlte/xr';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { showBlockers, showSurfaces } = $$props;
		const noise = new SimplexNoise();
		const light1 = new PointLight();
		const light2 = new PointLight();
		let torchX = 0;
		let torchZ = 0;
		const dracoLoader = useDraco();

		const gltf = useGltf('/models/xr/ruins.glb', { dracoLoader }).then((gltf) => {
			gltf.scene.traverse((node) => {
				node.castShadow = true;
				node.receiveShadow = true;
			});

			torchX = gltf.nodes.Torch1.position.x;
			torchZ = gltf.nodes.Torch1.position.z;

			return gltf;
		});

		let time = 0;

		useTask((delta) => {
			time += delta / 5;

			const x = noise.noise(time, 0) / 10;
			const y = noise.noise(0, time) / 10;
			const lightPositionX = torchX + x;
			const lightPositionZ = torchZ + y;

			light1.position.x = lightPositionX;
			light2.position.x = lightPositionX;
			light1.position.z = lightPositionZ;
			light2.position.z = lightPositionZ;
		});

		{
			function fallback($$renderer) {
				if (T.PerspectiveCamera) {
					$$renderer.push('<!--[-->');

					T.PerspectiveCamera($$renderer, {
						makeDefault: true,
						'position.y': 1.8,
						'position.z': 1.5,
						oncreate: (ref) => ref.lookAt(0, 1.8, 0),
						children: ($$renderer) => {
							OrbitControls($$renderer, { target: [0, 1.8, 0], enablePan: false, enableZoom: false });
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			XR($$renderer, {
				fallback,
				children: ($$renderer) => {
					Controller($$renderer, { left: true });
					$$renderer.push(`<!----> `);
					Controller($$renderer, { right: true });
					$$renderer.push(`<!----> `);
					Hand($$renderer, { left: true });
					$$renderer.push(`<!----> `);
					Hand($$renderer, { right: true });
					$$renderer.push(`<!---->`);
				},
				$$slots: { fallback: true, default: true }
			});
		}

		$$renderer.push(`<!----> `);

		$.await($$renderer, gltf, () => {}, ({ scene, nodes }) => {
			T($$renderer, { is: scene });
			$$renderer.push(`<!----> `);

			T($$renderer, {
				is: light1,
				intensity: 8,
				color: 'red',
				'position.y': nodes.Torch1.position.y + 0.45
			});

			$$renderer.push(`<!----> `);

			T($$renderer, {
				is: light2,
				intensity: 4,
				color: 'red',
				'position.y': nodes.Candles1.position.y + 0.45
			});

			$$renderer.push(`<!---->`);
		});

		$$renderer.push(`<!--]--> `);
		Sky($$renderer, { elevation: -3, rayleigh: 8, azimuth: -90 });
		$$renderer.push(`<!----> `);
		Surfaces($$renderer, { showSurfaces, showBlockers });
		$$renderer.push(`<!----> `);

		if (T.AmbientLight) {
			$$renderer.push('<!--[-->');
			T.AmbientLight($$renderer, { intensity: 0.25 });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.DirectionalLight) {
			$$renderer.push('<!--[-->');

			T.DirectionalLight($$renderer, {
				intensity: 0.5,
				position: [5, 5, 1],
				castShadow: true,
				'shadow.camera.top': 50,
				'shadow.camera.right': 50,
				'shadow.camera.left': -50,
				'shadow.camera.bottom': -50,
				'shadow.mapSize.width': 1024,
				'shadow.mapSize.height': 1024,
				'shadow.camera.far': 10
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}