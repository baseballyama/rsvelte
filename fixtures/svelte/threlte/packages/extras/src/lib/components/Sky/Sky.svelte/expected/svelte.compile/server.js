import * as $ from 'svelte/internal/server';
import { observe, T, useTask, useThrelte } from '@threlte/core';

import {
	CubeCamera,
	HalfFloatType,
	LinearMipmapLinearFilter,
	MathUtils,
	Vector3,
	WebGLCubeRenderTarget
} from 'three';

import { Sky } from 'three/examples/jsm/objects/Sky.js';

export default function Sky_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			scale = 1000,
			turbidity = 10,
			rayleigh = 3,
			mieCoefficient = 0.005,
			mieDirectionalG = 0.7,
			elevation = 2,
			azimuth = 180,
			setEnvironment = true,
			cubeMapSize = 128,
			webGLRenderTargetOptions = {},
			ref = void 0,
			children,
			$$slots,
			$$events,
			...props
		} = $$props;

		const sky = new Sky();
		const sunPosition = new Vector3();
		const { uniforms } = sky.material;
		const { renderer, scene, invalidate } = useThrelte();
		let renderTarget = void 0;
		let cubeCamera;

		const init = () => {
			renderTarget = new WebGLCubeRenderTarget(cubeMapSize, {
				type: HalfFloatType,
				generateMipmaps: true,
				minFilter: LinearMipmapLinearFilter,
				...webGLRenderTargetOptions
			});

			cubeCamera = new CubeCamera(1, 1.1, renderTarget);
		};

		const originalEnvironment = scene.environment;
		let running = false;

		useTask(
			() => {
				sky.scale.setScalar(scale);
				uniforms.turbidity.value = turbidity;
				uniforms.rayleigh.value = rayleigh;
				uniforms.mieCoefficient.value = mieCoefficient;
				uniforms.mieDirectionalG.value = mieDirectionalG;

				const phi = MathUtils.degToRad(90 - elevation);
				const theta = MathUtils.degToRad(azimuth);

				sunPosition.setFromSphericalCoords(1, phi, theta);
				uniforms.sunPosition.value.copy(sunPosition);

				if (setEnvironment) {
					if (!renderTarget || !cubeCamera) init();

					cubeCamera?.update(renderer, sky);
				}

				invalidate();
				running = false;
			},
			{ autoInvalidate: false, running: () => running }
		);

		observe.pre(
			() => [
				scale,
				turbidity,
				rayleigh,
				mieCoefficient,
				mieDirectionalG,
				elevation,
				azimuth
			],
			() => {
				running = true;
			}
		);

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			T($$renderer, $.spread_props([
				{ is: sky },
				props,
				{
					get ref() {
						return ref;
					},

					set ref($$value) {
						ref = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						children?.($$renderer, { ref: sky, sunPosition, renderTarget });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				}
			]));
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { ref });
	});
}