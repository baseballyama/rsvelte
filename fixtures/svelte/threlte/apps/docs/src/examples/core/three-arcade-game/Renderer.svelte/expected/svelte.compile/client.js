import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

export default function Renderer($$anchor, $$props) {
	$.push($$props, true);

	const $camera = () => $.store_get(camera, '$camera', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { camera, renderer, autoRender, renderStage } = useThrelte();
	let bloomEffect = undefined;
	let machineIsOff = $.derived(() => game.state === 'off' ? true : false);
	const bloomIntensity = Tween.of(() => $.get(machineIsOff) ? 0 : 1, { duration: 3e3 });

	$.user_effect(() => {
		if (bloomEffect) bloomEffect.intensity = bloomIntensity.current;
	});

	$.user_effect(() => {
		if ($camera() && game.arcadeMachineScene) {
			addComposerAndPasses();
		}
	});

	const composer = new EffectComposer(renderer);

	const addComposerAndPasses = () => {
		composer.removeAllPasses();
		composer.addPass(new RenderPass(game.arcadeMachineScene, $camera()));

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
		composer.addPass(new EffectPass($camera(), bloomEffect));

		composer.addPass(new EffectPass($camera(), new ChromaticAberrationEffect({
			offset: new Vector2(0.0005, 0.0005),
			modulationOffset: 0,
			radialModulation: false
		})));

		composer.addPass(new EffectPass($camera(), new BrightnessContrastEffect({ brightness: 0, contrast: 0.1 })));
		composer.addPass(new EffectPass($camera(), new SMAAEffect({ preset: SMAAPreset.LOW })));
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

	$.pop();
	$$cleanup();
}