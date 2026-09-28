import 'svelte/internal/disclose-version';
import { getPenguins } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { Chart, Tooltip, Waffle, Legend } from 'layerchart';
import { rollup, sum } from 'd3-array';

const penguins = await getPenguins();
var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Penguins($$anchor, $$props) {
	$.push($$props, true);

	const data = Array.from(rollup(penguins, (v) => v.length, (d) => d.island, (d) => d.species), ([island, bySpecies]) => ({ island, ...Object.fromEntries(bySpecies) }));
	var $$exports = { data };

	{
		const legend = ($$anchor) => {
			Legend($$anchor, {
				variant: 'swatches',
				placement: 'top-right',
				orientation: 'horizontal'
			});
		};

		const marks = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_2 = $.comment();
			var node = $.first_child(fragment_2);

			$.each(node, 17, () => context().series.visibleSeries, (s) => s.key, ($$anchor, s) => {
				Waffle($$anchor, {
					get seriesKey() {
						return $.get(s).key;
					},
					unit: 1,
					round: true,
					tooltip: true
				});
			});

			$.append($$anchor, fragment_2);
		};

		const tooltip = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_4 = $.comment();
			var node_1 = $.first_child(fragment_4);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_5 = root_1();
					var node_2 = $.first_child(fragment_5);

					$.component(node_2, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(() => $.set_text(text, data().island));
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});

					var node_3 = $.sibling(node_2, 2);

					$.component(node_3, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_7 = root();
								var node_4 = $.first_child(fragment_7);

								$.each(node_4, 17, () => context().series.visibleSeries, (s) => s.key, ($$anchor, s) => {
									var fragment_8 = $.comment();
									var node_5 = $.first_child(fragment_8);

									$.component(node_5, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
										Tooltip_Item($$anchor, {
											get label() {
												return $.get(s).key;
											},

											get value() {
												return data()[$.get(s).key];
											},

											get color() {
												return $.get(s).color;
											},
											format: 'integer',
											valueAlign: 'right'
										});
									});

									$.append($$anchor, fragment_8);
								});

								var node_6 = $.sibling(node_4, 2);

								$.component(node_6, () => Tooltip.Separator, ($$anchor, Tooltip_Separator) => {
									Tooltip_Separator($$anchor, {});
								});

								var node_7 = $.sibling(node_6, 2);

								{
									let $0 = $.derived(() => sum(context().series.visibleSeries, (s) => Number(data()[s.key]) || 0));

									$.component(node_7, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
										Tooltip_Item_1($$anchor, {
											label: 'total',
											get value() {
												return $.get($0);
											},
											format: 'integer',
											valueAlign: 'right'
										});
									});
								}

								$.append($$anchor, fragment_7);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_5);
				};

				$.component(node_1, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_4);
		};

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: 'island',
			bandPadding: 0.2,
			yNice: true,
			yBaseline: 0,
			series: [
				{ key: 'Adelie', color: 'var(--color-info)' },
				{ key: 'Chinstrap', color: 'var(--color-warning)' },
				{ key: 'Gentoo', color: 'var(--color-success)' }
			],
			padding: { left: 36, bottom: 24, top: 32, right: 8 },
			tooltipContext: { mode: 'band' },
			height: 400,
			rule: true,
			grid: true,
			legend,
			marks,
			tooltip,
			$$slots: { legend: true, marks: true, tooltip: true }
		});
	}

	return $.pop($$exports);
}