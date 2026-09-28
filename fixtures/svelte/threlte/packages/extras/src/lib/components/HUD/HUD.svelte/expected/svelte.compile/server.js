import * as $ from 'svelte/internal/server';
import { T, createCameraContext, createSceneContext, useThrelte } from '@threlte/core';

export default function HUD($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { renderStage, renderer, toneMapping } = useThrelte();

		let {
			autoRender = true,
			toneMapping: hudToneMapping,
			stage = renderStage,
			ref = void 0,
			children,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const { scene } = createSceneContext();
		const { camera } = createCameraContext();
		const key = Symbol('threlte-hud-render-stage');
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			T($$renderer, $.spread_props([
				{ is: scene, attach: false },
				rest,
				{
					get ref() {
						return ref;
					},

					set ref($$value) {
						ref = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						children?.($$renderer, { ref: scene });
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
		$.bind_props($$props, { ref });
	});
}