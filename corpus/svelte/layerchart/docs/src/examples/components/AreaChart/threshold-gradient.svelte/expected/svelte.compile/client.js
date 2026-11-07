import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Area,
	AreaChart,
	Highlight,
	LinearGradient,
	Tooltip,
	defaultChartPadding
} from 'layerchart';

import { createDateSeries } from '$lib/utils/data.js';
import { format } from '@layerstack/utils';

var root = $.from_html(`<!> <!>`, 1);

export default function Threshold_gradient($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({ count: 30, min: -20, max: 50, value: 'integer' });

	const colors = {
		positive: 'var(--color-success)',
		negative: 'var(--color-danger)'
	};

	var $$exports = { data };

	{
		const marks = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			const thresholdValue = $.derived(() => 0);
			const thresholdOffset = $.derived(() => context().yScale($.get(thresholdValue)) / (context().height + context().padding.bottom));

			{
				const children = ($$anchor, $$arg0) => {
					let gradient = () => ($$arg0?.()).gradient;

					{
						let $0 = $.derived(() => ({ stroke: gradient() }));

						Area($$anchor, {
							y0: (d) => $.get(thresholdValue),
							get line() {
								return $.get($0);
							},

							get fill() {
								return gradient();
							},
							fillOpacity: 0.2
						});
					}
				};

				let $0 = $.derived(() => [
					[$.get(thresholdOffset), colors.positive],
					[$.get(thresholdOffset), colors.negative]
				]);

				LinearGradient($$anchor, {
					get stops() {
						return $.get($0);
					},
					units: 'userSpaceOnUse',
					vertical: true,
					children,
					$$slots: { default: true }
				});
			}
		};

		const highlight = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			const value = $.derived(() => context().tooltip?.data && context().y(context().tooltip?.data));

			{
				let $0 = $.derived(() => ({ fill: $.get(value) < 0 ? colors.negative : colors.positive }));

				Highlight($$anchor, {
					lines: true,
					get points() {
						return $.get($0);
					}
				});
			}
		};

		const tooltip = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_4 = $.comment();
			var node = $.first_child(fragment_4);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					const value = $.derived(() => context().y(data()));
					var fragment_5 = root();
					var node_1 = $.first_child(fragment_5);

					$.component(node_1, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(($0) => $.set_text(text, $0), [() => format(context().x(data()), 'day')]);
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});

					var node_2 = $.sibling(node_1, 2);

					$.component(node_2, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_7 = $.comment();
								var node_3 = $.first_child(fragment_7);

								{
									let $0 = $.derived(() => context().y(data()));
									let $1 = $.derived(() => $.get(value) < 0 ? colors.negative : colors.positive);

									$.component(node_3, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
										Tooltip_Item($$anchor, {
											label: 'value',
											get value() {
												return $.get($0);
											},

											get color() {
												return $.get($1);
											}
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

				$.component(node, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_4);
		};

		let $0 = $.derived(() => defaultChartPadding({ right: 15 }));

		AreaChart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			get padding() {
				return $.get($0);
			},
			height: 300,
			marks,
			highlight,
			tooltip,
			$$slots: { marks: true, highlight: true, tooltip: true }
		});
	}

	return $.pop($$exports);
}