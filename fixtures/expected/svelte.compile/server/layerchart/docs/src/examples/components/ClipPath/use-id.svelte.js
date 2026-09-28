import * as $ from 'svelte/internal/server';
import { Chart, ClipPath, Frame, Layer, Pattern, Polygon } from 'layerchart';

export default function Use_id($$renderer) {
	{
		function children($$renderer, { context }) {
			Layer($$renderer, {
				children: ($$renderer) => {
					Polygon($$renderer, {
						id: 'star-shape',
						cx: context.width / 2,
						cy: context.height / 2,
						r: 120,
						points: 10,
						inset: 0.5,
						class: 'fill-none stroke-2 stroke-surface-content'
					});

					$$renderer.push(`<!----> `);

					{
						function children($$renderer, { pattern }) {
							ClipPath($$renderer, {
								useId: 'star-shape',
								children: ($$renderer) => {
									Frame($$renderer, { fill: pattern, class: 'stroke-surface-content' });
								},
								$$slots: { default: true }
							});
						}

						Pattern($$renderer, {
							size: 6,
							lines: [{ rotate: 45 }, { rotate: -45 }],
							children,
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		}

		Chart($$renderer, { height: 300, children, $$slots: { default: true } });
	}
}