import * as $ from 'svelte/internal/server';
import { Group } from 'three';
import { observe, T, useTask, useThrelte } from '@threlte/core';
import { useCubeCamera } from '../../hooks/useCubeCamera.svelte.js';

export default function CubeCamera($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			background = 'auto',
			far,
			fog = 'auto',
			frames = Infinity,
			near,
			onupdatestart,
			onupdatestop,
			resolution,
			children,
			ref = void 0,
			$$slots,
			$$events,
			...props
		} = $$props;

		const { camera, renderTarget } = useCubeCamera(() => near, () => far, () => resolution);
		const { renderer, scene } = useThrelte();
		const group = new Group();
		const inner = new Group();
		let count = 0;
		let running = false;

		const update = () => {
			// if frames === Infinity, the task will run indefinitely
			if (count < frames) {
				const lastBackground = scene.background;

				if (background !== 'auto') scene.background = background;

				const lastFog = scene.fog;

				if (fog !== 'auto') scene.fog = fog;

				inner.visible = false;
				camera.update(renderer, scene);
				scene.background = lastBackground;
				scene.fog = lastFog;
				inner.visible = true;
				count += 1;
			} else {
				running = false;
				onupdatestop?.();
			}
		};

		useTask(update, { running: () => running });

		const restart = () => {
			if (running) {
				onupdatestop?.();
			}

			count = 0;
			running = true;
			onupdatestart?.();
		};

		// if any of these props update, the task will need to be restarted
		observe(() => [background, far, near, fog, frames, resolution], restart);

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			T($$renderer, $.spread_props([
				{ is: group },
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
						T($$renderer, { is: camera });
						$$renderer.push(`<!----> `);

						T($$renderer, {
							is: inner,
							children: ($$renderer) => {
								children?.($$renderer, { camera, renderTarget, ref: group, restart, update });
								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

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
		$.bind_props($$props, { ref, camera, renderTarget, update, restart });
	});
}