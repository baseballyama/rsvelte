import * as $ from 'svelte/internal/server';
import { Chart, Circle, Points } from 'layerchart';
import { cls } from '@layerstack/tailwind';
import { getPenguins } from '$lib/data.remote';

const penguins = await getPenguins();

export default function Facet_brush($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = penguins.filter((d) => d.flipper_length_mm !== 'NA' && d.body_mass_g !== 'NA');

		{
			function marks($$renderer, { context }) {
				{
					function children($$renderer, { points }) {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(points);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let point = each_array[$$index];
							const isSelected = context.brush.contains({ x: point.data.flipper_length_mm, y: point.data.body_mass_g });

							Circle($$renderer, {
								cx: point.x,
								cy: point.y,
								r: isSelected ? 4 : 2.5,
								class: cls(isSelected
									? 'fill-primary/40 stroke-primary'
									: 'fill-neutral/10 stroke-neutral/30'),
								motion: 'spring'
							});
						}

						$$renderer.push(`<!--]-->`);
					}

					Points($$renderer, { children, $$slots: { default: true } });
				}
			}

			Chart($$renderer, {
				data,
				x: 'flipper_length_mm',
				y: 'body_mass_g',
				fx: 'species',
				xNice: true,
				yNice: true,
				grid: true,
				brush: { axis: 'both' },
				padding: { left: 52, bottom: 32, top: 24, right: 8 },
				height: 300,
				marks,
				$$slots: { marks: true }
			});
		}

		$.bind_props($$props, { data });
	});
}