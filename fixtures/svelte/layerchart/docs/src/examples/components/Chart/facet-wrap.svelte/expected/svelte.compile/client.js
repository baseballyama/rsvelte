import 'svelte/internal/disclose-version';
import { getLayoffs } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { Area, Chart, Frame, Text } from 'layerchart';
import { rollups, sum, max } from 'd3-array';
import { sort } from '@layerstack/utils';
import { utcMonth } from 'd3-time';

const layoffs = await getLayoffs();
var root = $.from_html(`<!> <!> <!>`, 1);

export default function Facet_wrap($$anchor, $$props) {
	$.push($$props, true);

	const columns = 3;

	// Monthly totals per industry
	const byIndustry = rollups(layoffs.filter((d) => d.totalLaidOff != null), (rows) => sum(rows, (d) => d.totalLaidOff ?? 0), (d) => d.industry, (d) => +utcMonth.floor(d.date));

	// The nine hardest-hit
	const industries = sort(byIndustry.map(([industry, months]) => ({ industry, months, total: sum(months, ([, total]) => total) })), 'total', 'desc').slice(0, columns * 3);

	// Each scaled to its own peak, so the panels compare shape rather than magnitude
	const data = industries.flatMap(({ industry, months }) => {
		const peak = max(months, ([, total]) => total) ?? 1;

		return sort(months, ([date]) => date).map(([date, total]) => ({ industry, date: new Date(date), share: total / peak }));
	});

	const names = industries.map((d) => d.industry);
	const column = (d) => names.indexOf(d.industry) % columns;
	const row = (d) => Math.floor(names.indexOf(d.industry) / columns);
	var $$exports = { data };

	{
		const marks = ($$anchor, $$arg0) => {
			let facet = () => ($$arg0?.()).facet;
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Frame(node, { class: 'stroke-surface-content/20 fill-none' });

			var node_1 = $.sibling(node, 2);

			Area(node_1, {
				y0: 0,
				y1: 'share',
				fill: 'var(--color-primary)',
				fillOpacity: 0.3,
				line: { stroke: 'var(--color-primary)' }
			});

			var node_2 = $.sibling(node_1, 2);

			Text(node_2, {
				get value() {
					return names[facet().row * columns + facet().column];
				},
				x: 6,
				y: 6,
				verticalAnchor: 'start',
				class: 'text-xs font-medium fill-surface-content'
			});

			$.append($$anchor, fragment_1);
		};

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'share',
			yDomain: [0, 1],
			fx: column,
			fy: row,
			facet: { padding: 0.05, axis: false, tooltip: (d) => d.industry },
			axis: false,
			series: [
				{
					key: 'share',
					label: 'share of peak',
					color: 'var(--color-primary)'
				}
			],
			tooltipContext: { mode: 'bisect-x' },
			highlight: {
				lines: true,
				points: { r: 3, strokeWidth: 4 },
				facetAll: true
			},
			props: { tooltip: { item: { format: 'percentRound' } } },
			padding: { top: 4, right: 4, bottom: 4, left: 4 },
			height: 320,
			marks,
			$$slots: { marks: true }
		});
	}

	return $.pop($$exports);
}