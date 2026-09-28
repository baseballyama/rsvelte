import * as $ from 'svelte/internal/server';
import { getLayerContext } from '$lib/contexts/layer.js';
import PolygonSvg from './Polygon.svg.svelte';
import PolygonCanvas from './Polygon.canvas.svelte';

export default function Polygon($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const layerCtx = getLayerContext();
		let { ref = void 0, $$slots, $$events, ...rest } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (layerCtx === 'svg') {
				$$renderer.push('<!--[0-->');

				PolygonSvg($$renderer, $.spread_props([
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
				PolygonCanvas($$renderer, $.spread_props([rest]));
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