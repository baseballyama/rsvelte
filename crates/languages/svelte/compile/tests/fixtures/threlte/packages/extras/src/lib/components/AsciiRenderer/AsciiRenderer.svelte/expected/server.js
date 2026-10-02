import * as $ from 'svelte/internal/server';
import { AsciiEffect } from 'three/examples/jsm/effects/AsciiEffect.js';
import { fromStore } from 'svelte/store';
import { useTask, useThrelte } from '@threlte/core';

export default function AsciiRenderer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const defaultCharacters = ' .:-+*=%@#';

		let {
			autoRender = true,
			bgColor = '#000000',
			camera,
			characters = defaultCharacters,
			fgColor = '#ffffff',
			onstart,
			onstop,
			options = {},
			scene,
			children
		} = $$props;

		const {
			autoRender: threlteAutoRender,
			camera: defaultCamera,
			renderStage,
			renderer,
			canvas,
			dom,
			scene: defaultScene,
			size
		} = useThrelte();

		// note || instead of ?? handles the case where `characters` === ''
		const charSet = $.derived(() => characters || defaultCharacters);

		const asciiEffect = $.derived(() => {
			const effect = new AsciiEffect(renderer, charSet(), options);

			effect.domElement.style.position = 'absolute';
			effect.domElement.style.top = '0px';
			effect.domElement.style.left = '0px';
			effect.domElement.style.pointerEvents = 'none';

			return effect;
		});

		const getEffect = () => asciiEffect();
		const sizeStore = fromStore(size);
		let running = false;

		useTask(
			() => {
				asciiEffect().render(scene ?? defaultScene, camera ?? defaultCamera.current);
			},
			{
				autoInvalidate: false,
				stage: renderStage,
				running: () => running
			}
		);

		const start = () => {
			running = true;
			onstart?.();
		};

		const stop = () => {
			running = false;
			onstop?.();
		};

		// this should stop the task on unmount as well
		children?.($$renderer, { asciiEffect: asciiEffect() });

		$$renderer.push(`<!---->`);
		$.bind_props($$props, { getEffect, start, stop });
	});
}