import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'scale',
	'turbidity',
	'rayleigh',
	'mieCoefficient',
	'mieDirectionalG',
	'elevation',
	'azimuth',
	'setEnvironment',
	'cubeMapSize',
	'webGLRenderTargetOptions',
	'ref',
	'children'
]);

export default function Sky_1($$anchor, $$props) {
	$.push($$props, true);

	let scale = $.prop($$props, 'scale', 3, 1000),
		turbidity = $.prop($$props, 'turbidity', 3, 10),
		rayleigh = $.prop($$props, 'rayleigh', 3, 3),
		mieCoefficient = $.prop($$props, 'mieCoefficient', 3, 0.005),
		mieDirectionalG = $.prop($$props, 'mieDirectionalG', 3, 0.7),
		elevation = $.prop($$props, 'elevation', 3, 2),
		azimuth = $.prop($$props, 'azimuth', 3, 180),
		setEnvironment = $.prop($$props, 'setEnvironment', 3, true),
		cubeMapSize = $.prop($$props, 'cubeMapSize', 3, 128),
		webGLRenderTargetOptions = $.prop($$props, 'webGLRenderTargetOptions', 19, () => ({})),
		ref = $.prop($$props, 'ref', 15),
		props = $.rest_props($$props, rest_excludes);

	const sky = new Sky();
	const sunPosition = new Vector3();
	const { uniforms } = sky.material;
	const { renderer, scene, invalidate } = useThrelte();
	let renderTarget = $.state(void 0);
	let cubeCamera;

	const init = () => {
		$.set(renderTarget, new WebGLCubeRenderTarget(cubeMapSize(), {
			type: HalfFloatType,
			generateMipmaps: true,
			minFilter: LinearMipmapLinearFilter,
			...webGLRenderTargetOptions()
		}));

		cubeCamera = new CubeCamera(1, 1.1, $.get(renderTarget));
	};

	const originalEnvironment = scene.environment;

	$.user_pre_effect(() => {
		if (setEnvironment() && $.get(renderTarget)) {
			scene.environment = $.get(renderTarget).texture;
			invalidate();
		} else if (!setEnvironment()) {
			scene.environment = originalEnvironment;
			invalidate();
		}
	});

	let running = $.state(false);

	useTask(
		() => {
			sky.scale.setScalar(scale());
			uniforms.turbidity.value = turbidity();
			uniforms.rayleigh.value = rayleigh();
			uniforms.mieCoefficient.value = mieCoefficient();
			uniforms.mieDirectionalG.value = mieDirectionalG();

			const phi = MathUtils.degToRad(90 - elevation());
			const theta = MathUtils.degToRad(azimuth());

			sunPosition.setFromSphericalCoords(1, phi, theta);
			uniforms.sunPosition.value.copy(sunPosition);

			if (setEnvironment()) {
				if (!$.get(renderTarget) || !cubeCamera) init();

				cubeCamera?.update(renderer, sky);
			}

			invalidate();
			$.set(running, false);
		},
		{ autoInvalidate: false, running: () => $.get(running) }
	);

	observe.pre(
		() => [
			scale(),
			turbidity(),
			rayleigh(),
			mieCoefficient(),
			mieDirectionalG(),
			elevation(),
			azimuth()
		],
		() => {
			$.set(running, true);
		}
	);

	$.user_effect(() => {
		return () => {
			sky.material.dispose();
			scene.environment = originalEnvironment;

			try {
				$.get(renderTarget)?.dispose();
			} catch(error) {
				console.warn('Could not dispose renderTarget:', error);
			}
		};
	});

	T($$anchor, $.spread_props(
		{
			get is() {
				return sky;
			}
		},
		() => props,
		{
			get ref() {
				return ref();
			},

			set ref($$value) {
				ref($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				$.snippet(node, () => $$props.children ?? $.noop, () => ({ ref: sky, sunPosition, renderTarget: $.get(renderTarget) }));
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}
	));

	$.pop();
}