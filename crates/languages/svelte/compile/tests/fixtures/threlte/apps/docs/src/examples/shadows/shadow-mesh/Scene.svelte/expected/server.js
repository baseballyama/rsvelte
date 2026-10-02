import * as $ from 'svelte/internal/server';

import {
	DirectionalLight,
	Mesh,
	MeshNormalMaterial,
	PerspectiveCamera,
	Plane,
	TorusKnotGeometry,
	Vector3,
	Vector4
} from 'three';

import { ShadowMesh } from 'three/examples/jsm/objects/ShadowMesh.js';
import { T, useTask } from '@threlte/core';
import { OrbitControls } from '@threlte/extras';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const planeY = 0;
		const planeOffset = 0.01;
		const planeConstant = planeY + planeOffset;
		const yHat = new Vector3(0, 1, 0);
		const plane = new Plane(yHat, planeConstant);
		let { w = 0.01 } = $$props;
		const mesh = new Mesh(new TorusKnotGeometry(), new MeshNormalMaterial());

		mesh.translateY(2);

		const translationAxis = new Vector3();

		// only used to create a DirectionalLightHelper
		// notice that it's not added to the scene at the bottom but the shadow is still visible
		const light = new DirectionalLight();

		light.translateOnAxis(translationAxis.set(1, 1, -1).normalize(), 5);

		const lightPosition4D = new Vector4(...light.position);
		const shadowMesh = new ShadowMesh(mesh);
		const floor = new Mesh();
		const floorSize = 15;

		floor.lookAt(plane.normal);

		const camera = new PerspectiveCamera();

		camera.translateOnAxis(translationAxis.set(1, 1, 1).normalize(), 20);
		camera.lookAt(floor.position);

		useTask((dt) => {
			mesh.rotateY(dt);
			shadowMesh.update(plane, lightPosition4D);
		});

		T($$renderer, {
			is: camera,
			makeDefault: true,
			children: ($$renderer) => {
				OrbitControls($$renderer, { enableDamping: true, maxPolarAngle: 2 / 5 * Math.PI });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		T($$renderer, {
			is: floor,
			children: ($$renderer) => {
				if (T.PlaneGeometry) {
					$$renderer.push('<!--[-->');
					T.PlaneGeometry($$renderer, { args: [floorSize, floorSize] });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (T.MeshBasicMaterial) {
					$$renderer.push('<!--[-->');
					T.MeshBasicMaterial($$renderer, { color: '#ccccaa' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);
		T($$renderer, { is: mesh });
		$$renderer.push(`<!----> `);
		T($$renderer, { is: shadowMesh });
		$$renderer.push(`<!----> `);
		T($$renderer, { is: light, attach: false, target: mesh });
		$$renderer.push(`<!----> `);

		if (T.DirectionalLightHelper) {
			$$renderer.push('<!--[-->');
			T.DirectionalLightHelper($$renderer, { args: [light] });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}