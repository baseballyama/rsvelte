import * as $ from 'svelte/internal/server';
import { getLayerContext } from '$lib/contexts/layer.js';
import LinearGradientSvg from './LinearGradient.svg.svelte';
import LinearGradientCanvas from './LinearGradient.canvas.svelte';
import LinearGradientHtml from './LinearGradient.html.svelte';

export default function LinearGradient($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const layerCtx = getLayerContext();
		let { ref = void 0, $$slots, $$events, ...rest } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (layerCtx === 'svg') {
				$$renderer.push('<!--[0-->');

				LinearGradientSvg($$renderer, $.spread_props([
					rest,
					{
						get ref() {
							return ref;
						},

						set ref($$value) {
							ref = $$value;
							$$settled = false;
						}
					}
				]));
			} else if (layerCtx === 'canvas') {
				$$renderer.push('<!--[1-->');
				LinearGradientCanvas($$renderer, $.spread_props([rest]));
			} else if (layerCtx === 'html') {
				$$renderer.push('<!--[2-->');
				LinearGradientHtml($$renderer, $.spread_props([rest]));
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
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