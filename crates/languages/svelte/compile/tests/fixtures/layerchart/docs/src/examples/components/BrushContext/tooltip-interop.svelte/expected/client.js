import 'svelte/internal/disclose-version';
import { getAppleStock } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';

import {
	Area,
	Axis,
	Chart,
	ChartClipPath,
	Highlight,
	Layer,
	LinearGradient,
	Tooltip,
	defaultChartPadding
} from 'layerchart';

import { format } from '@layerstack/utils';

const data = await getAppleStock();
var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Tooltip_interop($$anchor, $$props) {
	$.push($$props, true);

	let xDomain = $.state($.proxy([null, null]));
	var $$exports = { data };

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			Layer(node, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					Axis(node_1, { placement: 'left', grid: true, rule: true });

					var node_2 = $.sibling(node_1, 2);

					Axis(node_2, { placement: 'bottom', rule: true });

					var node_3 = $.sibling(node_2, 2);

					ChartClipPath(node_3, {
						children: ($$anchor, $$slotProps) => {
							{
								const children = ($$anchor, $$arg0) => {
									let gradient = () => ($$arg0?.()).gradient;

									Area($$anchor, {
										line: { class: 'stroke-2 stroke-primary' },
										get fill() {
											return gradient();
										}
									});
								};

								LinearGradient($$anchor, {
									class: 'from-primary/50 to-primary/1',
									vertical: true,
									children,
									$$slots: { default: true }
								});
							}
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_3, 2);

					Highlight(node_4, { points: true, lines: true });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;

					$.next();

					var text = $.text();

					$.template_effect(($0) => $.set_text(text, $0), [() => format(data().value, 'currency')]);
					$.append($$anchor, text);
				};

				$.component(node_5, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, {
						y: 'data',
						xOffset: 4,
						anchor: 'bottom',
						variant: 'none',
						class: 'text-sm font-semibold text-primary leading-3 bg-surface-100/80 backdrop-blur-xs px-2 py-1 rounded-sm',
						children,
						$$slots: { default: true }
					});
				});
			}

			var node_6 = $.sibling(node_5, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;

					$.next();

					var text_1 = $.text();

					$.template_effect(($0) => $.set_text(text_1, $0), [() => format(data().date, 'day')]);
					$.append($$anchor, text_1);
				};

				let $0 = $.derived(() => context().height + context().padding.top);

				$.component(node_6, () => Tooltip.Root, ($$anchor, Tooltip_Root_1) => {
					Tooltip_Root_1($$anchor, {
						x: 'data',
						get y() {
							return $.get($0);
						},
						yOffset: 2,
						anchor: 'top',
						variant: 'none',
						class: 'text-sm font-semibold bg-primary text-primary-content leading-3 px-2 py-1 rounded-sm whitespace-nowrap',
						children,
						$$slots: { default: true }
					});
				});
			}

			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(() => defaultChartPadding({ left: 25, bottom: 24 }));

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			get xDomain() {
				return $.get(xDomain);
			},
			y: 'value',
			yDomain: [0, null],
			get padding() {
				return $.get($0);
			},
			tooltipContext: { mode: 'quadtree-x' },
			brush: {
				onBrushEnd: (e) => {
					$.set(xDomain, e.brush.x, true);
					e.brush.reset();
				}
			},
			height: 300,
			children,
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}