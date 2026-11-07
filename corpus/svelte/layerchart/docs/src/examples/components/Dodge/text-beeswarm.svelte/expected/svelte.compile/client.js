import 'svelte/internal/disclose-version';
import { getCountries2020 } from '$lib/data.remote';
import { scaleLog } from 'd3-scale';
import { sortFunc } from '@layerstack/utils';
import * as $ from 'svelte/internal/client';
import { Chart, Dodge, Text, Tooltip } from 'layerchart';

const countries = await getCountries2020();
const data = [...countries].sort(sortFunc('population', 'desc'));
var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Text_beeswarm($$anchor, $$props) {
	$.push($$props, true);

	var $$exports = { data };

	{
		const marks = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;

			{
				const children = ($$anchor, $$arg0) => {
					let items = () => ($$arg0?.()).items;
					var fragment_2 = $.comment();
					var node = $.first_child(fragment_2);

					$.each(node, 17, items, ({ data: country, x, y, r, index }) => index, ($$anchor, $$item) => {
						let country = () => $.get($$item).data;
						let x = () => $.get($$item).x;
						let y = () => $.get($$item).y;
						let r = () => $.get($$item).r;
						let index = () => $.get($$item).index;

						{
							let $0 = $.derived(() => r() * 1.1);
							let $1 = $.derived(() => context().cScale?.(country().continent));

							Text($$anchor, {
								get x() {
									return x();
								},

								get y() {
									return y();
								},

								get value() {
									return country().code2;
								},

								get fontSize() {
									return $.get($0);
								},
								textAnchor: 'middle',
								verticalAnchor: 'middle',
								get fill() {
									return $.get($1);
								},
								class: 'font-semibold',
								onpointermove: (e) => context().tooltip.show(e, country()),
								get onpointerleave() {
									return context().tooltip.hide;
								}
							});
						}
					});

					$.append($$anchor, fragment_2);
				};

				Dodge($$anchor, {
					axis: 'y',
					anchor: 'middle',
					padding: 1,
					children,
					$$slots: { default: true }
				});
			}
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

								$.template_effect(() => $.set_text(text, data().name));
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

								$.component(node_4, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
									Tooltip_Item($$anchor, {
										label: 'Continent',
										get value() {
											return data().continent;
										}
									});
								});

								var node_5 = $.sibling(node_4, 2);

								{
									let $0 = $.derived(() => data().lifeExpectancy.toFixed(1));

									$.component(node_5, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
										Tooltip_Item_1($$anchor, {
											label: 'Life expectancy',
											get value() {
												return `${$.get($0) ?? ''} years`;
											}
										});
									});
								}

								var node_6 = $.sibling(node_5, 2);

								$.component(node_6, () => Tooltip.Item, ($$anchor, Tooltip_Item_2) => {
									Tooltip_Item_2($$anchor, {
										label: 'Population',
										get value() {
											return data().population;
										},
										format: 'metric'
									});
								});

								$.append($$anchor, fragment_7);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_5);
				};

				$.component(node_1, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, {
						get context() {
							return context();
						},
						children,
						$$slots: { default: true }
					});
				});
			}

			$.append($$anchor, fragment_4);
		};

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: 'lifeExpectancy',
			xNice: true,
			r: 'population',
			rRange: [2, 40],
			c: 'continent',
			cDomain: [
				'Africa',
				'Asia',
				'Europe',
				'North America',
				'Oceania',
				'South America'
			],
			cRange: [
				'var(--color-warning)',
				'var(--color-info)',
				'var(--color-success)',
				'var(--color-danger)',
				'var(--color-secondary)',
				'var(--color-primary)'
			],
			padding: { top: 12, bottom: 32, left: 12, right: 12 },
			height: 420,
			axis: { placement: 'bottom', rule: true },
			props: { xAxis: { label: 'Life expectancy (log)' } },
			marks,
			tooltip,
			$$slots: { marks: true, tooltip: true }
		});
	}

	return $.pop($$exports);
}