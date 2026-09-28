import * as $ from 'svelte/internal/server';
import { T, useTask, useThrelte } from '@threlte/core';
import { OrbitControls, Sky, useFBO, useGltf } from '@threlte/extras';

import {
	CameraHelper,
	Group,
	Mesh,
	MeshStandardMaterial,
	PerspectiveCamera,
	PlaneGeometry
} from 'three';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const gltf = useGltf('/models/Duck.glb');
		const { renderer, scene } = useThrelte();
		const fbo = useFBO(() => ({ size: { width: 1024, height: 2048 } }));
		const group = new Group();
		const cameraMeshHeight = 1;
		const cameraRotationRadius = 5;

		// create the plane and other camera in the script tag so that we don't have to bind to the ref and worry about `undefined` cases
		const rotatingCamera = new PerspectiveCamera(40, 1, 2, 8);

		const helper = new CameraHelper(rotatingCamera);
		const planeMesh = new Mesh(new PlaneGeometry(), new MeshStandardMaterial({ map: fbo.texture }));

		planeMesh.position.setZ(-1 * (cameraMeshHeight + cameraRotationRadius));
		planeMesh.scale.setScalar(10);

		let time = 0;

		useTask((delta) => {
			time += delta * 0.2;

			const c = Math.cos(time);
			const s = Math.sin(time);

			rotatingCamera.position.set(cameraRotationRadius * c, 2 * c * s, cameraRotationRadius * s);
			rotatingCamera.lookAt(group.position);
			planeMesh.visible = false;
			helper.visible = false;

			const lastRenderTarget = renderer.getRenderTarget();

			renderer.setRenderTarget(fbo);
			renderer.render(scene, rotatingCamera);
			helper.visible = true;
			planeMesh.visible = true;
			renderer.setRenderTarget(lastRenderTarget);
		});

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');

			T.PerspectiveCamera($$renderer, {
				'position.x': 5,
				'position.y': 5,
				'position.z': 10,
				makeDefault: true,
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

		if (T.AmbientLight) {
			$$renderer.push('<!--[-->');
			T.AmbientLight($$renderer, {});
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);
		Sky($$renderer, {});
		$$renderer.push(`<!----> `);
		T($$renderer, { is: rotatingCamera, manual: true });
		$$renderer.push(`<!----> `);
		T($$renderer, { is: helper, attach: scene });
		$$renderer.push(`<!----> `);
		T($$renderer, { is: planeMesh });
		$$renderer.push(`<!----> `);

		T($$renderer, {
			is: group,
			children: ($$renderer) => {
				if (T.Group) {
					$$renderer.push('<!--[-->');

					T.Group($$renderer, {
						'position.y': -1,
						children: ($$renderer) => {
							$.await($$renderer, gltf, () => {}, ({ scene }) => {
								T($$renderer, { is: scene });
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
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}