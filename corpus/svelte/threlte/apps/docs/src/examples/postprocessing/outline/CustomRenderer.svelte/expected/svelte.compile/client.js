import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useTask, useThrelte } from '@threlte/core';

import {
	BlendFunction,
	EffectComposer,
	EffectPass,
	OutlineEffect,
	RenderPass
} from 'postprocessing';

export default function CustomRenderer($$anchor, $$props) {
	$.push($$props, true);

	const $size = () => $.store_get(size, '$size', $$stores);
	const $camera = () => $.store_get(camera, '$camera', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { scene, renderer, camera, size, autoRender, renderStage } = useThrelte();
	const composer = new EffectComposer(renderer);
	const renderPass = new RenderPass(scene);

	composer.addPass(renderPass);

	$.user_effect(() => {
		composer.setSize($size().width, $size().height);
	});

	const outlineEffectOptions = {
		blendFunction: BlendFunction.ALPHA,
		edgeStrength: 100,
		pulseSpeed: 0.0,
		xRay: true,
		blur: true
	};

	const outlineEffect = new OutlineEffect(scene, undefined, outlineEffectOptions);

	$.user_effect(() => {
		outlineEffect.selection.add($$props.mesh);

		return () => {
			outlineEffect.selection.clear();
		};
	});

	const outlineEffectPass = new EffectPass(undefined, outlineEffect);

	composer.addPass(outlineEffectPass);

	$.user_effect(() => {
		renderPass.mainCamera = $camera();
		outlineEffect.mainCamera = $camera();
		outlineEffectPass.mainCamera = $camera();
	});

	$.user_effect(() => {
		return () => {
			composer.removeAllPasses();
			outlineEffectPass.dispose();
			renderPass.dispose();
			composer.dispose();
		};
	});

	$.user_effect(() => {
		const last = autoRender.current;

		autoRender.set(false);

		return () => {
			autoRender.set(last);
		};
	});

	useTask(
		(delta) => {
			composer.render(delta);
		},
		{ stage: renderStage, autoInvalidate: false }
	);

	var $$exports = { outlineEffectOptions };
	var $$pop = $.pop($$exports);

	$$cleanup();

	return $$pop;
}