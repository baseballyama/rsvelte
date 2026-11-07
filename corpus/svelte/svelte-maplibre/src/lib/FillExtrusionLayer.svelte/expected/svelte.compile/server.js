import * as $ from 'svelte/internal/server';
import { getId } from './context.svelte.js';
import Layer from './Layer.svelte';

export default function FillExtrusionLayer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			id = getId('symbol'),
			source = undefined,
			sourceLayer = undefined,
			beforeId = undefined,
			beforeLayerType = undefined,
			paint,
			layout = undefined,
			filter = undefined,
			minzoom = undefined,
			maxzoom = undefined,
			hoverCursor = undefined,
			manageHoverState = false,
			hovered = void 0,
			eventsIfTopMost = false,
			interactive = true,
			children,
			onclick = undefined,
			ondblclick = undefined,
			oncontextmenu = undefined,
			onmouseenter = undefined,
			onmousemove = undefined,
			onmouseleave = undefined
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Layer($$renderer, {
				id,
				type: 'fill-extrusion',
				source,
				sourceLayer,
				beforeId,
				beforeLayerType,
				paint,
				layout,
				filter,
				minzoom,
				maxzoom,
				hoverCursor,
				manageHoverState,
				eventsIfTopMost,
				interactive,
				onclick,
				ondblclick,
				oncontextmenu,
				onmouseenter,
				onmousemove,
				onmouseleave,
				get hovered() {
					return hovered;
				},

				set hovered($$value) {
					hovered = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					children?.($$renderer);
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { hovered });
	});
}