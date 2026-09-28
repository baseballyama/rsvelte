import * as $ from 'svelte/internal/server';
import { Chart, Layer, Polygon } from 'layerchart';
import PolygonPlaygroundControls from '$lib/components/controls/PolygonPlaygroundControls.svelte';

export default function Playground($$renderer) {
	let config = {
		points: 8,
		cornerRadius: 0,
		inset: 0,
		rotate: 0,
		scaleX: 1,
		scaleY: 1,
		skewX: 0,
		skewY: 0,
		tiltX: 0,
		tiltY: 0
	};

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		PolygonPlaygroundControls($$renderer, {
			get config() {
				return config;
			},

			set config($$value) {
				config = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		{
			function children($$renderer, { context }) {
				Layer($$renderer, {
					children: ($$renderer) => {
						Polygon($$renderer, $.spread_props([
							{ cx: context.width / 2, cy: context.height / 2, r: 100 },
							config
						]));
					},
					$$slots: { default: true }
				});
			}

			Chart($$renderer, { height: 300, children, $$slots: { default: true } });
		}

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}