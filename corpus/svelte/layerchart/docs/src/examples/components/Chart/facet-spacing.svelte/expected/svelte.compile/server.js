import * as $ from 'svelte/internal/server';
import { Chart, Circle } from 'layerchart';
import { RangeField } from 'svelte-ux';
import { getPenguins } from '$lib/data.remote';

const penguins = await getPenguins();

export default function Facet_spacing($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = penguins.filter((d) => d.flipper_length_mm !== 'NA' && d.body_mass_g !== 'NA');
		let paddingX = 0.1;
		let paddingY = 0.1;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="grid grid-cols-2 gap-4 mb-4">`);

			RangeField($$renderer, {
				label: 'Padding X',
				min: 0,
				max: 0.5,
				step: 0.05,
				get value() {
					return paddingX;
				},

				set value($$value) {
					paddingX = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Padding Y',
				min: 0,
				max: 0.5,
				step: 0.05,
				get value() {
					return paddingY;
				},

				set value($$value) {
					paddingY = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> `);

			{
				function marks($$renderer) {
					Circle($$renderer, {
						cx: 'flipper_length_mm',
						cy: 'body_mass_g',
						r: 2.5,
						fill: 'var(--color-primary)',
						fillOpacity: 0.6
					});
				}

				Chart($$renderer, {
					data,
					x: 'flipper_length_mm',
					y: 'body_mass_g',
					fx: 'species',
					fy: 'sex',
					facet: { paddingX, paddingY },
					xNice: true,
					yNice: true,
					padding: { left: 52, bottom: 32, top: 24, right: 60 },
					height: 480,
					marks,
					$$slots: { marks: true }
				});
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
	});
}