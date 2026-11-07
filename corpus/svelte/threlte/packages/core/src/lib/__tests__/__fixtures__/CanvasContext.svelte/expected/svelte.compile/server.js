import * as $ from 'svelte/internal/server';
import Canvas from '../../Canvas.svelte';
import { useThrelte } from '../../context/compounds/useThrelte.js';

export default function CanvasContext($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { oncontext, $$slots, $$events, ...rest } = $$props;

		Canvas($$renderer, $.spread_props([
			rest,
			{
				children: ($$renderer) => {
					const ctx = useThrelte();

					$$renderer.push(`<!---->${$.escape(oncontext?.(ctx))}`);
				},
				$$slots: { default: true }
			}
		]));
	});
}