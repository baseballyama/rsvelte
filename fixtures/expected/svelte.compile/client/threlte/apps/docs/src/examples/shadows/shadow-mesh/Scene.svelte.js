import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

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

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const planeY = 0;
	const planeOffset = 0.01;
	const planeConstant = planeY + planeOffset;
	const yHat = new Vector3(0, 1, 0);
	const plane = new Plane(yHat, planeConstant);
	let w = $.prop($$props, 'w', 3, 0.01);
	const mesh = new Mesh(new TorusKnotGeometry(), new MeshNormalMaterial());

	mesh.translateY(2);

	const translationAxis = new Vector3();

	// only used to create a DirectionalLightHelper
	// notice that it's not added to the scene at the bottom but the shadow is still visible
	const light = new DirectionalLight();

	light.translateOnAxis(translationAxis.set(1, 1, -1).normalize(), 5);

	const lightPosition4D = new Vector4(...light.position);

	$.user_effect(() => {
		lightPosition4D.w = w();
	});

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

	var fragment = root_1();
	var node = $.first_child(fragment);

	T(node, {
		get is() {
			return camera;
		},
		makeDefault: true,
		children: ($$anchor, $$slotProps) => {
			OrbitControls($$anchor, { enableDamping: true, maxPolarAngle: 2 / 5 * Math.PI });
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	T(node_1, {
		get is() {
			return floor;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root();
			var node_2 = $.first_child(fragment_2);

			$.component(node_2, () => T.PlaneGeometry, ($$anchor, T_PlaneGeometry) => {
				T_PlaneGeometry($$anchor, { args: [floorSize, floorSize] });
			});

			var node_3 = $.sibling(node_2, 2);

			$.component(node_3, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
				T_MeshBasicMaterial($$anchor, { color: '#ccccaa' });
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_1, 2);

	T(node_4, {
		get is() {
			return mesh;
		}
	});

	var node_5 = $.sibling(node_4, 2);

	T(node_5, {
		get is() {
			return shadowMesh;
		}
	});

	var node_6 = $.sibling(node_5, 2);

	T(node_6, {
		get is() {
			return light;
		},
		attach: false,
		get target() {
			return mesh;
		}
	});

	var node_7 = $.sibling(node_6, 2);

	{
		let $0 = $.derived(() => [light]);

		$.component(node_7, () => T.DirectionalLightHelper, ($$anchor, T_DirectionalLightHelper) => {
			T_DirectionalLightHelper($$anchor, {
				get args() {
					return $.get($0);
				}
			});
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}