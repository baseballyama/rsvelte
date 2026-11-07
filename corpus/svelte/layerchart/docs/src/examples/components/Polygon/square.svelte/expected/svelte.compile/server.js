import * as $ from 'svelte/internal/server';
import { Chart, Layer, Polygon } from 'layerchart';
import PolygonControls from '$lib/components/controls/PolygonControls.svelte';

export default function Square($$renderer) {
	let rotate = 0;
	let cornerRadius = 0;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		PolygonControls($$renderer, {
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
							r: 60,
							points: 4,
							rotate: rotate + 45,
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
}