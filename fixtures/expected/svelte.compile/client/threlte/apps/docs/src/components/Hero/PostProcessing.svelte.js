import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useTask, useThrelte } from '@threlte/core';

import {
	BlendFunction,
	BloomEffect,
	BrightnessContrastEffect,
	ChromaticAberrationEffect,
	EffectComposer,
	EffectPass,
	FXAAEffect,
	RenderPass,
	ToneMappingEffect,
	ToneMappingMode
} from 'postprocessing';

import { HalfFloatType } from 'three';
import { StaticNoiseEffect } from './StaticNoise/StaticNoise';

export default function PostProcessing($$anchor, $$props) {
	$.push($$props, true);

	const $camera = () => $.store_get(camera, '$camera', $$stores);
	const $size = () => $.store_get(size, '$size', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let bloomIntensity = $.prop($$props, 'bloomIntensity', 3, 2),
		bloomRadius = $.prop($$props, 'bloomRadius', 3, 0.6),
		bloomLuminanceSmoothing = $.prop($$props, 'bloomLuminanceSmoothing', 3, 0.025),
		brightness = $.prop($$props, 'brightness', 3, 0),
		contrast = $.prop($$props, 'contrast', 3, 0),
		noiseIntensity = $.prop($$props, 'noiseIntensity', 3, 0.03);

	/**
	 * Chromatic Aberration
	 */
	const chromaticAberrationEffect = new ChromaticAberrationEffect();

	chromaticAberrationEffect.offset.set(0.0008, 0);

	/**
	 * Tone Mapping
	 */
	const toneMappingEffect = new ToneMappingEffect({ mode: ToneMappingMode.ACES_FILMIC });

	/**
	 * Noise
	 */
	const noiseEffect = new StaticNoiseEffect({ blendFunction: BlendFunction.COLOR_DODGE });

	$.user_effect(() => {
		noiseEffect.blendMode.opacity.value = noiseIntensity();
	});

	/**
	 * Anti-aliasing
	 */
	const fxaaEffect = new FXAAEffect();

	/**
	 * Bloom
	 */
	const bloomEffect = new BloomEffect({
		mipmapBlur: true,
		luminanceThreshold: 0.5,
		radius: 0.6,
		intensity: 2
	});

	$.user_pre_effect(() => {
		bloomEffect.intensity = bloomIntensity();
		bloomEffect.mipmapBlurPass.radius = bloomRadius();
		bloomEffect.luminanceMaterial.smoothing = bloomLuminanceSmoothing();
	});

	/**
	 * Brightness/Contrast
	 */
	const bcEffect = new BrightnessContrastEffect();

	$.user_pre_effect(() => {
		bcEffect.contrast = contrast();
		bcEffect.brightness = brightness();
	});

	const { renderer, scene, camera, autoRender, renderStage } = useThrelte();
	const composer = new EffectComposer(renderer, { alpha: true, frameBufferType: HalfFloatType });

	$.user_effect(() => {
		composer.addPass(new RenderPass(scene, $camera()));
		composer.addPass(new EffectPass(camera.current, fxaaEffect));
		composer.addPass(new EffectPass(camera.current, noiseEffect, bcEffect, bloomEffect, toneMappingEffect));

		return () => {
			composer.removeAllPasses();
		};
	});

	// When using PostProcessing, we need to disable autoRender
	$.user_effect(() => {
		let before = autoRender.current;

		autoRender.set(false);

		return () => {
			autoRender.set(before);
		};
	});

	useTask(
		() => {
			composer.render();
		},
		{ stage: renderStage, autoInvalidate: false }
	);

	const { size } = useThrelte();

	$.user_effect(() => {
		composer.setSize($size().width, $size().height);
	});

	$.pop();
	$$cleanup();
}