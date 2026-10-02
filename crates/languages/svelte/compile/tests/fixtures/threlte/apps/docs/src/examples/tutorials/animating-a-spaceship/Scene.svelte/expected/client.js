import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useTask, useThrelte } from '@threlte/core';
import { OrbitControls } from '@threlte/extras';
import Spaceship from './models/spaceship.svelte';

import {
	Color,
	Mesh,
	MeshStandardMaterial,
	PMREMGenerator,
	PlaneGeometry,
	Raycaster,
	Vector2,
	Vector3,
	WebGLRenderTarget
} from 'three';

import Stars from './Stars.svelte';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const $camera = () => $.store_get(camera, '$camera', $$stores);
	const $size = () => $.store_get(size, '$size', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { scene, size, camera, renderer } = useThrelte();
	let intersectionPoint;
	let translAccelleration = 0;
	let angleAccelleration = 0;
	let pmrem = new PMREMGenerator(renderer);
	let envMapRT;
	let spaceShipRef = $.state(void 0);
	let translY = $.state(0);
	let angleZ = $.state(0);
	const composer = new EffectComposer(renderer);
	const renderPass = new RenderPass(scene, $camera());
	const bloomPass = new UnrealBloomPass(new Vector2($size().width, $size().height), 0.275, 1, 0);
	const outputPass = new OutputPass();

	composer.addPass(renderPass);
	composer.addPass(bloomPass);
	composer.addPass(outputPass);

	$.user_effect(() => {
		composer.setSize($size().width, $size().height);
		bloomPass.resolution.set($size().width, $size().height);
	});

	$.user_effect(() => {
		renderPass.camera = $camera();
	});

	// Replaces the default render task, which does not execute because autoRender=false
	// https://threlte.xyz/docs/learn/basics/render-modes#render-modes-and-custom-rendering
	const { renderStage } = useThrelte();

	useTask(
		() => {
			if (intersectionPoint) {
				const targetY = intersectionPoint?.y || 0;

				translAccelleration += (targetY - $.get(translY // stiffness
				)) * 0.002;
				translAccelleration *= 0.95; // damping
				$.set(translY, $.get(translY) + translAccelleration);

				const dir = intersectionPoint.clone().sub(new Vector3(0, $.get(translY), 0)).normalize();
				const dirCos = dir.dot(new Vector3(0, 1, 0));
				const angle = Math.acos(dirCos) - Math.PI * 0.5;

				angleAccelleration += (angle - $.get(angleZ // stiffness
				)) * 0.01;
				angleAccelleration *= 0.85; // damping
				$.set(angleZ, $.get(angleZ) + angleAccelleration);
			}

			if (envMapRT) {
				envMapRT.dispose();
			}

			if ($.get(spaceShipRef)) {
				$.get(spaceShipRef).visible = false;
				scene.background = null;
				envMapRT = pmrem.fromScene(scene, 0, 0.1, 1000);
				scene.background = new Color('#598889').multiplyScalar(0.05);
				$.get(spaceShipRef).visible = true;

				$.get(spaceShipRef).traverse((child) => {
					if ('material' in child) {
						const material = child.material;

						if ('envMapIntensity' in material) {
							material.envMap = envMapRT.texture;
							material.envMapIntensity = 100;
							material.normalScale.set(0.3, 0.3);
						}
					}
				});
			}

			composer.render();
		},
		{ stage: renderStage }
	);

	const planeGeo = new PlaneGeometry(20, 20);
	const mesh = new Mesh(planeGeo);
	const raycaster = new Raycaster();
	const pointer = new Vector2();

	function onpointermove(event) {
		pointer.x = event.clientX / window.innerWidth * 2 - 1;
		pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
		raycaster.setFromCamera(pointer, $camera());

		const intersects = raycaster.intersectObject(mesh);

		intersectionPoint = intersects[0]?.point;

		if (intersectionPoint) {
			// this prevents the spring motion to be different while the pointer
			// spans the x axis
			intersectionPoint.x = 3;
		}
	}

	var fragment = root();

	$.event('pointermove', $.window, onpointermove);

	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: [-10, 6, 15],
			fov: 25,
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, { enableDamping: true, enableZoom: false, target: [0, 0, 0] });
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, {
			intensity: 1.8,
			position: [0, 10, 0],
			castShadow: true,
			'shadow.bias': -0.0001
		});
	});

	var node_2 = $.sibling(node_1, 2);

	{
		let $0 = $.derived(() => [0, $.get(translY), 0]);
		let $1 = $.derived(() => [$.get(angleZ), 0, $.get(angleZ), 'ZXY']);

		Spaceship(node_2, {
			get position() {
				return $.get($0);
			},

			get rotation() {
				return $.get($1);
			},

			get ref() {
				return $.get(spaceShipRef);
			},

			set ref($$value) {
				$.set(spaceShipRef, $$value, true);
			}
		});
	}

	var node_3 = $.sibling(node_2, 2);

	Stars(node_3, {});
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}