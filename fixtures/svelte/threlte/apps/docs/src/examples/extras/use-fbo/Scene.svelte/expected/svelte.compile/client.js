import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

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

	var fragment = root();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			'position.x': 5,
			'position.y': 5,
			'position.z': 10,
			makeDefault: true,
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, {});
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, {});
	});

	var node_2 = $.sibling(node_1, 2);

	Sky(node_2, {});

	var node_3 = $.sibling(node_2, 2);

	T(node_3, {
		get is() {
			return rotatingCamera;
		},
		manual: true
	});

	var node_4 = $.sibling(node_3, 2);

	T(node_4, {
		get is() {
			return helper;
		},

		get attach() {
			return scene;
		}
	});

	var node_5 = $.sibling(node_4, 2);

	T(node_5, {
		get is() {
			return planeMesh;
		}
	});

	var node_6 = $.sibling(node_5, 2);

	T(node_6, {
		get is() {
			return group;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_2 = $.comment();
			var node_7 = $.first_child(fragment_2);

			$.component(node_7, () => T.Group, ($$anchor, T_Group) => {
				T_Group($$anchor, {
					'position.y': -1,
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = $.comment();
						var node_8 = $.first_child(fragment_3);

						$.await(node_8, () => gltf, null, ($$anchor, $$source) => {
							var $$value = $.derived(() => {
								var { scene } = $.get($$source);

								return { scene };
							});

							var scene = $.derived(() => $.get($$value).scene);

							T($$anchor, {
								get is() {
									return $.get(scene);
								}
							});
						});

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}