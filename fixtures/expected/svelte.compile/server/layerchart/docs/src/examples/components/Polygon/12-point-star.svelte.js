import * as $ from 'svelte/internal/server';
import { Chart, Layer, Polygon } from 'layerchart';
import PolygonControls from '$lib/components/controls/PolygonControls.svelte';

export default function _2_point_star($$renderer, $$props) {
	let starInset = 0.7;
	let rotate = 0;
	let cornerRadius = 0;
	const data = undefined;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		PolygonControls($$renderer, {
			get starInset() {
				return starInset;
			},

			set starInset($$value) {
				starInset = $$value;
				$$settled = false;
			},

			get rotate() {
				return rotate;
			},

			set rotate($$value) {
				rotate = $$value;
				$$settled = false;
			},

			get cornerRadius() {
				return cornerRadius;
			},

			set cornerRadius($$value) {
				cornerRadius = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		{
			function children($$renderer, { context }) {
				Layer($$renderer, {
					children: ($$renderer) => {
						Polygon($$renderer, {
							cx: context.width / 2,
							cy: context.height / 2,
							r: 50,
							points: 12,
							inset: starInset,
							rotate,
							cornerRadius
						});
					},
					$$slots: { default: true }
				});
			}

			Chart($$renderer, { height: 150, children, $$slots: { default: true } });
		}

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
	$.bind_props($$props, { data });
}