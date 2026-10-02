import * as $ from 'svelte/internal/server';
import { Chart, Group, Layer, Polygon } from 'layerchart';
import PolygonControls from '$lib/components/controls/PolygonControls.svelte';

export default function Arrow($$renderer, $$props) {
	let cornerRadius = 0;
	const data = undefined;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		PolygonControls($$renderer, {
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
						Group($$renderer, {
							x: context.width / 2,
							y: context.height / 2,
							children: ($$renderer) => {
								const size = 60;

								Polygon($$renderer, {
									points: [
										{ x: size, y: 0 },
										{ x: size / 4, y: -size / 2 },
										{ x: size / 4, y: -size / 4 },
										{ x: -size, y: -size / 4 },
										{ x: -size, y: size / 4 },
										{ x: size / 4, y: size / 4 },
										{ x: size / 4, y: size / 2 },
										{ x: size, y: 0 }
									],
									cornerRadius
								});
							},
							$$slots: { default: true }
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