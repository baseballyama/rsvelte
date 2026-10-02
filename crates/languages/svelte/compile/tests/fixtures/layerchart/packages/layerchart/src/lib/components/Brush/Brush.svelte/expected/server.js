import * as $ from 'svelte/internal/server';
import { getLayerContext } from '$lib/contexts/layer.js';
import BrushSvg from './Brush.svg.svelte';
import BrushCanvas from './Brush.canvas.svelte';
import BrushHtml from './Brush.html.svelte';

export default function Brush($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { state: stateProp = void 0, $$slots, $$events, ...rest } = $$props;
		const layerCtx = getLayerContext();
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (layerCtx === 'canvas') {
				$$renderer.push('<!--[0-->');

				BrushCanvas($$renderer, $.spread_props([
					rest,
					{
						get state() {
							return stateProp;
						},

						set state($$value) {
							stateProp = $$value;
							$$settled = false;
						}
					}
				]));
			} else if (layerCtx === 'html') {
				$$renderer.push('<!--[1-->');

				BrushHtml($$renderer, $.spread_props([
					rest,
					{
						get state() {
							return stateProp;
						},

						set state($$value) {
							stateProp = $$value;
							$$settled = false;
						}
					}
				]));
			} else {
				$$renderer.push('<!--[-1-->');

				BrushSvg($$renderer, $.spread_props([
					rest,
					{
						get state() {
							return stateProp;
						},

						set state($$value) {
							stateProp = $$value;
							$$settled = false;
						}
					}
				]));
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { state: stateProp });
	});
}