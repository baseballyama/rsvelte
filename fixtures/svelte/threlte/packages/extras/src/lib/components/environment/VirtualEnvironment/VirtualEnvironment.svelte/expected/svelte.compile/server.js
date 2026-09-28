import * as $ from 'svelte/internal/server';
import { createSceneContext, observe, T, useTask, useThrelte } from '@threlte/core';
import { useCubeCamera } from '../../../hooks/useCubeCamera.svelte.js';
import { useEnvironment } from '../utils/useEnvironment.svelte.js';

export default function VirtualEnvironment($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const ctx = useThrelte();

		let {
			far = 1000,
			frames = Infinity,
			isBackground = false,
			isEnvironment = true,
			near = 0.1,
			onupdatestart,
			onupdatestop,
			resolution = 256,
			scene: parentScene = ctx.scene,
			visible,
			children
		} = $$props;

		// Create a parent scene to render the virtual environment into
		const { scene } = createSceneContext();

		const { camera, renderTarget } = useCubeCamera(() => near, () => far, () => resolution);

		useEnvironment(() => parentScene, () => renderTarget.texture, () => isBackground, () => isEnvironment);

		const update = () => {
			camera.update(ctx.renderer, scene);
		};

		let running = false;
		let count = 0;

		useTask(
			() => {
				// if frames === Infinity, the task will run indefinitely
				if (count < frames) {
					update();
					count += 1;
				} else {
					running = false;
					onupdatestop?.();
				}
			},
			{ running: () => running }
		);

		const restart = () => {
			if (running) {
				onupdatestop?.();
			}

			count = 0;
			running = true;
			onupdatestart?.();
		};

		// if any of these props update, the task will need to be restarted
		observe(() => [far, near, frames, resolution], restart);

		T($$renderer, {
			is: scene,
			attach: visible ? undefined : false,
			children: ($$renderer) => {
				T($$renderer, { is: camera });
				$$renderer.push(`<!----> `);
				children?.($$renderer, { camera, renderTarget, restart, update });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$.bind_props($$props, { camera, renderTarget, update, restart });
	});
}