import * as $ from 'svelte/internal/server';
import { useTask, useThrelte } from '@threlte/core';

import {
	BloomEffect,
	BrightnessContrastEffect,
	ChromaticAberrationEffect,
	EffectComposer,
	EffectPass,
	KernelSize,
	RenderPass,
	SMAAEffect,
	SMAAPreset
} from 'postprocessing';

import { onMount } from 'svelte';
import { Tween } from 'svelte/motion';
import { Vector2 } from 'three';
import { game } from './game/Game.svelte';

export default function Renderer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { camera, renderer, autoRender, renderStage } = useThrelte();
		let bloomEffect = undefined;
		let machineIsOff = $.derived(() => game.state === 'off' ? true : false);
		const bloomIntensity = Tween.of(() => machineIsOff() ? 0 : 1, { duration: 3e3 });
		const composer = new EffectComposer(renderer);

		const addComposerAndPasses = () => {
			composer.removeAllPasses();
			composer.addPass(new RenderPass(game.arcadeMachineScene, $.store_get($$store_subs ??= {}, '$camera', camera)));

			bloomEffect = new BloomEffect({
				intensity: bloomIntensity.current,
				luminanceThreshold: 0.15,
				height: 512,
				width: 512,
				luminanceSmoothing: 0.08,
				mipmapBlur: true,
				kernelSize: KernelSize.MEDIUM
			});

			bloomEffect.luminancePass.enabled = true;
			bloomEffect.ignoreBackground = true;
			composer.addPass(new EffectPass($.store_get($$store_subs ??= {}, '$camera', camera), bloomEffect));

			composer.addPass(new EffectPass($.store_get($$store_subs ??= {}, '$camera', camera), new ChromaticAberrationEffect({
				offset: new Vector2(0.0005, 0.0005),
				modulationOffset: 0,
				radialModulation: false
			})));

			composer.addPass(new EffectPass($.store_get($$store_subs ??= {}, '$camera', camera), new BrightnessContrastEffect({ brightness: 0, contrast: 0.1 })));
			composer.addPass(new EffectPass($.store_get($$store_subs ??= {}, '$camera', camera), new SMAAEffect({ preset: SMAAPreset.LOW })));
		};

		// When using PostProcessing, we need to disable autoRender
		onMount(() => {
			let before = autoRender.current;

			autoRender.set(false);

			return () => {
				autoRender.set(before);
				composer.removeAllPasses();
			};
		});

		useTask(
			(delta) => {
				composer.render(delta);
			},
			{ stage: renderStage }
		);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}