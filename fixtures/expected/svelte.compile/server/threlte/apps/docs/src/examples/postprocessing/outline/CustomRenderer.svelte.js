import * as $ from 'svelte/internal/server';
import { useTask, useThrelte } from '@threlte/core';

import {
	BlendFunction,
	EffectComposer,
	EffectPass,
	OutlineEffect,
	RenderPass
} from 'postprocessing';

export default function CustomRenderer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { mesh } = $$props;
		const { scene, renderer, camera, size, autoRender, renderStage } = useThrelte();
		const composer = new EffectComposer(renderer);
		const renderPass = new RenderPass(scene);

		composer.addPass(renderPass);

		const outlineEffectOptions = {
			blendFunction: BlendFunction.ALPHA,
			edgeStrength: 100,
			pulseSpeed: 0.0,
			xRay: true,
			blur: true
		};

		const outlineEffect = new OutlineEffect(scene, undefined, outlineEffectOptions);
		const outlineEffectPass = new EffectPass(undefined, outlineEffect);

		composer.addPass(outlineEffectPass);

		useTask(
			(delta) => {
				composer.render(delta);
			},
			{ stage: renderStage, autoInvalidate: false }
		);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { outlineEffectOptions });
	});
}