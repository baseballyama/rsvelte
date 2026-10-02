import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart, Tooltip } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';
import { scaleThreshold, scaleTime } from 'd3-scale';
import { format } from '@layerstack/utils';

var root = $.from_html(`<!> <!>`, 1);

export default function Single_dimension($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({
		count: 50,
		min: 0,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});

	var $$exports = { data };

	{
		const tooltip = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					$.component(node_1, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(($0) => $.set_text(text, $0), [() => format(context().x(data()))]);
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});

					var node_2 = $.sibling(node_1, 2);

					$.component(node_2, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = $.comment();
								var node_3 = $.first_child(fragment_4);

								{
									let $0 = $.derived(() => context().c(data()));
									let $1 = $.derived(() => context().cScale?.(context().c(data())));

									$.component(node_3, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
										Tooltip_Item($$anchor, {
											label: 'Status',
											get value() {
												return $.get($0);
											},

											get color() {
												return $.get($1);
											}
										});
									});
								}

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_2);
				};

				$.component(node, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(scaleThreshold);

		BarChart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			y: (d) => 1,
			c: 'value',
			get cScale() {
				return $.get($0);
			},
			cDomain: [10, 50],
			cRange: [
				'var(--color-danger)',
				'var(--color-warning)',
				'var(--color-success)'
			],
			axis: 'x',
			bandPadding: 0.1,
			grid: false,
			props: {
				bars: { radius: 4, strokeWidth: 0, rounded: 'all' },
				highlight: {
					bar: {
						radius: 4,
						fill: 'none',
						stroke: 'currentColor',
						strokeWidth: 2
					}
				},
				xAxis: {
					ticks: (scale) => scaleTime(scale.domain(), scale.range()).ticks()
				},
				rule: { y: false }
			},
			height: 60,
			tooltip,
			$$slots: { tooltip: true }
		});
	}

	return $.pop($$exports);
}