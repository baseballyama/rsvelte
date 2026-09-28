import * as $ from 'svelte/internal/server';
import { min, max } from 'd3-array';
import { getChartContext } from '$lib/contexts/chart.js';

export default function Threshold_base($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const ctx = getChartContext();

		// Mark as composite so child Areas don't register
		ctx.registerComponent({ name: 'Threshold', kind: 'composite-mark' });

		let { Area, ClipPath, curve, defined, below, above, children } = $$props;

		$$renderer.push(`<!---->`);

		{
			{
				function clip($$renderer) {
					if (Area) {
						$$renderer.push('<!--[-->');

						Area($$renderer, {
							y0: (d) => ctx.y(d)[1],
							y1: (d) => max(ctx.yDomain),
							curve,
							defined
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}

				if (ClipPath) {
					$$renderer.push('<!--[-->');

					ClipPath($$renderer, {
						clip,
						children: ($$renderer) => {
							above?.($$renderer, { curve, defined });
							$$renderer.push(`<!---->`);
						},
						$$slots: { clip: true, default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			$$renderer.push(` `);

			{
				function clip($$renderer) {
					if (Area) {
						$$renderer.push('<!--[-->');

						Area($$renderer, {
							y0: (d) => min(ctx.yDomain),
							y1: (d) => ctx.y(d)[1],
							curve,
							defined
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}

				if (ClipPath) {
					$$renderer.push('<!--[-->');

					ClipPath($$renderer, {
						clip,
						children: ($$renderer) => {
							below?.($$renderer, { curve, defined });
							$$renderer.push(`<!---->`);
						},
						$$slots: { clip: true, default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			$$renderer.push(` `);
			children?.($$renderer, { curve, defined });
			$$renderer.push(`<!---->`);
		}

		$$renderer.push(`<!---->`);
	});
}