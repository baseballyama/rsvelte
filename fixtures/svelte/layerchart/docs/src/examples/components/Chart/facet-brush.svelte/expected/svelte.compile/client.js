import 'svelte/internal/disclose-version';
import { getPenguins } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { Chart, Circle, Points } from 'layerchart';
import { cls } from '@layerstack/tailwind';

const penguins = await getPenguins();

export default function Facet_brush($$anchor, $$props) {
	$.push($$props, true);

	const data = penguins.filter((d) => d.flipper_length_mm !== 'NA' && d.body_mass_g !== 'NA');
	var $$exports = { data };

	{
		const marks = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;

			{
				const children = ($$anchor, $$arg0) => {
					let points = () => ($$arg0?.()).points;
					var fragment_2 = $.comment();
					var node = $.first_child(fragment_2);

					$.each(node, 17, points, (point) => point.data, ($$anchor, point) => {
						const isSelected = $.derived(() => context().brush.contains({
							x: $.get(point).data.flipper_length_mm,
							y: $.get(point).data.body_mass_g
						}));

						{
							let $0 = $.derived(() => $.get(isSelected) ? 4 : 2.5);

							let $1 = $.derived(() => cls($.get(isSelected)
								? 'fill-primary/40 stroke-primary'
								: 'fill-neutral/10 stroke-neutral/30'));

							Circle($$anchor, {
								get cx() {
									return $.get(point).x;
								},

								get cy() {
									return $.get(point).y;
								},

								get r() {
									return $.get($0);
								},

								get class() {
									return $.get($1);
								},
								motion: 'spring'
							});
						}
					});

					$.append($$anchor, fragment_2);
				};

				Points($$anchor, { children, $$slots: { default: true } });
			}
		};

		Chart($$anchor, {
			get data() {
				return data;
			},
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

	return $.pop($$exports);
}