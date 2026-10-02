import * as $ from 'svelte/internal/server';
import { getLayerContext } from '$lib/contexts/layer.js';
import PathSvg from './Path.svg.svelte';
import PathCanvas from './Path.canvas.svelte';

export default function Path($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const layerCtx = getLayerContext();
		let { pathRef = void 0, $$slots, $$events, ...rest } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (layerCtx === 'svg') {
				$$renderer.push('<!--[0-->');

				PathSvg($$renderer, $.spread_props([
					rest,
					{
						get pathRef() {
							return pathRef;
						},

						set pathRef($$value) {
							pathRef = $$value;
							$$settled = false;
						}
					}
				]));
			} else if (layerCtx === 'canvas') {
				$$renderer.push('<!--[1-->');
				PathCanvas($$renderer, $.spread_props([rest]));
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
		$.bind_props($$props, { pathRef });
	});
}