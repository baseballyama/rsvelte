import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Tooltip, Waffle } from 'layerchart';
import { sum } from 'd3-array';
import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Stacked($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({
		count: 6,
		min: 200,
		max: 1200,
		value: 'integer',
		keys: ['apples', 'bananas', 'cherries', 'grapes']
	}).map((d, i) => ({
		...d,
		period: `Q${i % 4 + 1} '${(20 + Math.floor(i / 4)) % 100}`
	}));

	var $$exports = { data };

	{
		const marks = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.each(node, 17, () => context().series.visibleSeries, (s) => s.key, ($$anchor, s) => {
				Waffle($$anchor, {
					get seriesKey() {
						return $.get(s).key;
					},
					unit: 50,
					tooltip: true
				});
			});

			$.append($$anchor, fragment_1);
		};

		const tooltip = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_3 = $.comment();
			var node_1 = $.first_child(fragment_3);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_4 = root_1();
					var node_2 = $.first_child(fragment_4);

					$.component(node_2, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(() => $.set_text(text, data().period));
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});

					var node_3 = $.sibling(node_2, 2);

					$.component(node_3, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_6 = root();
								var node_4 = $.first_child(fragment_6);

								$.each(node_4, 17, () => context().series.visibleSeries, (s) => s.key, ($$anchor, s) => {
									var fragment_7 = $.comment();
									var node_5 = $.first_child(fragment_7);

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

									$.append($$anchor, fragment_7);
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

								$.append($$anchor, fragment_6);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_4);
				};

				$.component(node_1, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_3);
		};

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: 'period',
			bandPadding: 0.2,
			yNice: true,
			yBaseline: 0,
			series: [
				{ key: 'apples', color: 'var(--color-apples)' },
				{ key: 'bananas', color: 'var(--color-bananas)' },
				{ key: 'cherries', color: 'var(--color-cherries)' },
				{ key: 'grapes', color: 'var(--color-grapes)' }
			],
			padding: { left: 36, bottom: 40, top: 8, right: 8 },
			tooltipContext: { mode: 'band' },
			height: 400,
			rule: true,
			grid: true,
			legend: true,
			marks,
			tooltip,
			$$slots: { marks: true, tooltip: true }
		});
	}

	return $.pop($$exports);
}