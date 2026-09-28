import * as $ from 'svelte/internal/server';
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

export default function PostProcessing($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			bloomIntensity = 2,
			bloomRadius = 0.6,
			bloomLuminanceSmoothing = 0.025,
			brightness = 0,
			contrast = 0,
			noiseIntensity = 0.03
		} = $$props;

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

		/**
		 * Brightness/Contrast
		 */
		const bcEffect = new BrightnessContrastEffect();

		const { renderer, scene, camera, autoRender, renderStage } = useThrelte();
		const composer = new EffectComposer(renderer, { alpha: true, frameBufferType: HalfFloatType });

		// When using PostProcessing, we need to disable autoRender
		useTask(
			() => {
				composer.render();
			},
			{ stage: renderStage, autoInvalidate: false }
		);

		const { size } = useThrelte();

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}