import * as $ from 'svelte/internal/server';
import BrushBase from './Brush.base.svelte';
import Rect from '../Rect/Rect.html.svelte';

export default function Brush_html($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { state: stateProp = void 0, $$slots, $$events, ...rest } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			BrushBase($$renderer, $.spread_props([
				{ Rect },
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

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { state: stateProp });
	});
}