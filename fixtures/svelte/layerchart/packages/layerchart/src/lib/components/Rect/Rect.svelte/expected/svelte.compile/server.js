import * as $ from 'svelte/internal/server';
import { getLayerContext } from '$lib/contexts/layer.js';
import RectSvg from './Rect.svg.svelte';
import RectCanvas from './Rect.canvas.svelte';
import RectHtml from './Rect.html.svelte';

export default function Rect($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const layerCtx = getLayerContext();
		let { ref = void 0, $$slots, $$events, ...rest } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (layerCtx === 'svg') {
				$$renderer.push('<!--[0-->');

				RectSvg($$renderer, $.spread_props([
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
				RectCanvas($$renderer, $.spread_props([rest]));
			} else if (layerCtx === 'html') {
				$$renderer.push('<!--[2-->');
				RectHtml($$renderer, $.spread_props([rest]));
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