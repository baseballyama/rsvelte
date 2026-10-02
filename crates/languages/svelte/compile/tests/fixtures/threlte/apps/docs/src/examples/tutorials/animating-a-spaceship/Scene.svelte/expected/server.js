import * as $ from 'svelte/internal/server';
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

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { scene, size, camera, renderer } = useThrelte();
		let intersectionPoint;
		let translAccelleration = 0;
		let angleAccelleration = 0;
		let pmrem = new PMREMGenerator(renderer);
		let envMapRT;
		let spaceShipRef = void 0;
		let translY = 0;
		let angleZ = 0;
		const composer = new EffectComposer(renderer);
		const renderPass = new RenderPass(scene, $.store_get($$store_subs ??= {}, '$camera', camera));
		const bloomPass = new UnrealBloomPass(new Vector2($.store_get($$store_subs ??= {}, '$size', size).width, $.store_get($$store_subs ??= {}, '$size', size).height), 0.275, 1, 0);
		const outputPass = new OutputPass();

		composer.addPass(renderPass);
		composer.addPass(bloomPass);
		composer.addPass(outputPass);

		// Replaces the default render task, which does not execute because autoRender=false
		// https://threlte.xyz/docs/learn/basics/render-modes#render-modes-and-custom-rendering
		const { renderStage } = useThrelte();

		useTask(
			() => {
				if (intersectionPoint) {
					const targetY = intersectionPoint?.y || 0;

					translAccelleration += (targetY - translY) * 0.002; // stiffness
					translAccelleration *= 0.95; // damping
					translY += translAccelleration;

					const dir = intersectionPoint.clone().sub(new Vector3(0, translY, 0)).normalize();
					const dirCos = dir.dot(new Vector3(0, 1, 0));
					const angle = Math.acos(dirCos) - Math.PI * 0.5;

					angleAccelleration += (angle - angleZ) * 0.01; // stiffness
					angleAccelleration *= 0.85; // damping
					angleZ += angleAccelleration;
				}

				if (envMapRT) {
					envMapRT.dispose();
				}

				if (spaceShipRef) {
					spaceShipRef.visible = false;
					scene.background = null;
					envMapRT = pmrem.fromScene(scene, 0, 0.1, 1000);
					scene.background = new Color('#598889').multiplyScalar(0.05);
					spaceShipRef.visible = true;

					spaceShipRef.traverse((child) => {
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
			raycaster.setFromCamera(pointer, $.store_get($$store_subs ??= {}, '$camera', camera));

			const intersects = raycaster.intersectObject(mesh);

			intersectionPoint = intersects[0]?.point;

			if (intersectionPoint) {
				// this prevents the spring motion to be different while the pointer
				// spans the x axis
				intersectionPoint.x = 3;
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (T.PerspectiveCamera) {
				$$renderer.push('<!--[-->');

				T.PerspectiveCamera($$renderer, {
					makeDefault: true,
					position: [-10, 6, 15],
					fov: 25,
					children: ($$renderer) => {
						OrbitControls($$renderer, { enableDamping: true, enableZoom: false, target: [0, 0, 0] });
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
					intensity: 1.8,
					position: [0, 10, 0],
					castShadow: true,
					'shadow.bias': -0.0001
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			Spaceship($$renderer, {
				position: [0, translY, 0],
				rotation: [angleZ, 0, angleZ, 'ZXY'],
				get ref() {
					return spaceShipRef;
				},

				set ref($$value) {
					spaceShipRef = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);
			Stars($$renderer, {});
			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}