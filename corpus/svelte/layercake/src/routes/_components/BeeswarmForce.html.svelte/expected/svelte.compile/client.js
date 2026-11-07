import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Html } from 'layercake';
import { scaleOrdinal } from 'd3-scale';
import BeeswarmHtml from '../../_components/BeeswarmForce.html.svelte';
import data from '../../_data/us-senate.csv';

var root = $.from_html(`<div class="chart-container svelte-mwt2ju"><!></div>`);

export default function BeeswarmForce_html($$anchor, $$props) {
	$.push($$props, true);

	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const xKey = 'date_of_birth';

	const zKey = 'gender';
	const titleKey = 'name';
	const r = 6;
	const seriesNames = new Set();
	const seriesColors = ['#fc0', '#000'];

	const dataTransformed = data.map((d) => {
		seriesNames.add(d[zKey]);

		return {
			[titleKey]: d[titleKey],
			[zKey]: d[zKey],
			[xKey]: +d[xKey].split('-')[0]
		};
	});

	var div = root();
	var node = $.child(div);

	{
		const children = ($$anchor, $$arg0) => {
			let width = () => ($$arg0?.()).width;

			Html($$anchor, {
				children: ($$anchor, $$slotProps) => {
					{
						let $0 = $.derived(() => width() < 400 ? r / 1.25 : r);

						BeeswarmHtml($$anchor, {
							get r() {
								return $.get($0);
							},
							strokeWidth: 1,
							xStrength: 0.95,
							yStrength: 0.075,
							getTitle: (d) => d[titleKey]
						});
					}
				},
				$$slots: { default: true }
			});
		};

		let $0 = $.derived(scaleOrdinal);
		let $1 = $.derived(() => Array.from(seriesNames));

		LayerCake(node, {
			padding: { left: 10, bottom: 15 },
			x: xKey,
			z: zKey,
			get zScale() {
				return $.get($0);
			},

			get zDomain() {
				return $.get($1);
			},

			get zRange() {
				return seriesColors;
			},

			get data() {
				return dataTransformed;
			},
			children,
			$$slots: { default: true }
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}