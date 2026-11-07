import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Html } from 'layercake';
import { scaleOrdinal } from 'd3-scale';
import BeeswarmHtml from '../../_components/Beeswarm.html.svelte';
import data from '../../_data/cars-2.csv';

var root = $.from_html(`<div class="chart-container svelte-19dzhjj"><!></div>`);

export default function Beeswarm_html($$anchor, $$props) {
	$.push($$props, true);

	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const xKey = 'Weight_in_lbs';

	const zKey = 'Origin';
	const titleKey = 'Name';
	const r = 4;
	const seriesNames = new Set();
	const seriesColors = ['#ccc', '#fc0', '#000'];

	const dataTransformed = data.map((d) => {
		seriesNames.add(d[zKey]);

		return { [titleKey]: d[titleKey], [xKey]: +d[xKey], [zKey]: d[zKey] };
	});

	var div = root();
	var node = $.child(div);

	{
		const children = ($$anchor, $$arg0) => {
			let width = () => ($$arg0?.()).width;

			Html($$anchor, {
				children: ($$anchor, $$slotProps) => {
					{
						let $0 = $.derived(() => width() < 400 ? r / 1.6 : r);

						BeeswarmHtml($$anchor, {
							get r() {
								return $.get($0);
							},
							spacing: 1,
							getTitle: (d) => d.data[titleKey]
						});
					}
				},
				$$slots: { default: true }
			});
		};

		let $0 = $.derived(scaleOrdinal);
		let $1 = $.derived(() => [...seriesNames].sort());

		LayerCake(node, {
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