import 'svelte/internal/disclose-version';
import { getPenguins } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { BarChart, Frame, Text } from 'layerchart';
import { flatGroup } from 'd3-array';

const penguins = await getPenguins();
var root = $.from_html(`<!> <!>`, 1);

export default function Facet_annotation($$anchor, $$props) {
	$.push($$props, true);

	// One row per species * island, with a column per sex to stack
	const data = flatGroup(penguins.filter((d) => d.sex !== 'NA'), (d) => d.species, (d) => d.island).map(([species, island, rows]) => ({
		species,
		island,
		female: rows.filter((d) => d.sex === 'female').length,
		male: rows.filter((d) => d.sex === 'male').length
	}));

	var $$exports = { data };

	{
		const aboveMarks = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			let facet = () => ($$arg0?.()).facet;
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Frame(node, { class: 'stroke-surface-content/20 fill-none' });

			var node_1 = $.sibling(node, 2);

			{
				var consequent = ($$anchor) => {
					{
						let $0 = $.derived(() => context().width - 6);

						Text($$anchor, {
							value: 'While Chinstrap and Gentoo penguins were each observed on only one island, Adelie penguins were observed on all three islands.',
							get x() {
								return $.get($0);
							},
							y: 6,
							width: 220,
							truncate: false,
							textAnchor: 'end',
							verticalAnchor: 'start',
							class: 'text-[10px] fill-surface-content/70'
						});
					}
				};

				$.if(node_1, ($$render) => {
					if (facet().fy === 'Adelie') $$render(consequent);
				});
			}

			$.append($$anchor, fragment_1);
		};

		BarChart($$anchor, {
			get data() {
				return data;
			},
			orientation: 'horizontal',
			y: 'island',
			fy: 'species',
			series: [
				{ key: 'female', label: 'female', color: 'var(--color-info)' },
				{ key: 'male', label: 'male', color: 'var(--color-success)' }
			],
			legend: true,
			grid: true,
			padding: { left: 72, bottom: 40, top: 8, right: 72 },
			height: 360,
			aboveMarks,
			$$slots: { aboveMarks: true }
		});
	}

	return $.pop($$exports);
}