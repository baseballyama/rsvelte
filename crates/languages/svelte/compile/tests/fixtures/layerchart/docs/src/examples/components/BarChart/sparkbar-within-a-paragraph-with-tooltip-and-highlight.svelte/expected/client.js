import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart, Tooltip } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';
import { format } from '@layerstack/utils';

var root = $.from_html(`<!> <!>`, 1);

var root_1 = $.from_html(`<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam pretium, ligula ac sollicitudin
	ullamcorper, leo justo pretium tellus, at gravida ex quam et orci. <!> Sed ipsum justo, facilisis id tempor hendrerit, suscipit eu ipsum. Mauris ut sapien quis nibh volutpat
	venenatis. Ut viverra justo varius sapien convallis venenatis vel faucibus urna.</p>`);

export default function Sparkbar_within_a_paragraph_with_tooltip_and_highlight($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({ count: 30, min: 20, max: 100 });
	var $$exports = { data };
	var p = root_1();
	var node = $.sibling($.child(p));

	{
		const tooltip = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_1 = root();
					var node_2 = $.first_child(fragment_1);

					$.component(node_2, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							get value() {
								return data().date;
							},
							format: 'day'
						});
					});

					var node_3 = $.sibling(node_2, 2);

					$.component(node_3, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_2 = $.comment();
								var node_4 = $.first_child(fragment_2);

								{
									let $0 = $.derived(() => format(data().value, 'decimal'));

									$.component(node_4, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
										Tooltip_Item($$anchor, {
											label: 'value',
											get value() {
												return $.get($0);
											}
										});
									});
								}

								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_1);
				};

				let $0 = $.derived(() => context().height + 4);

				$.component(node_1, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, {
						get context() {
							return context();
						},
						class: 'text-xs',
						contained: false,
						get y() {
							return $.get($0);
						},
						xOffset: 0,
						children,
						$$slots: { default: true }
					});
				});
			}

			$.append($$anchor, fragment);
		};

		BarChart(node, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			axis: false,
			grid: false,
			bandPadding: 0.1,
			props: { bars: { radius: 1, strokeWidth: 0 } },
			height: 18,
			width: 124,
			class: 'inline-block',
			tooltip,
			$$slots: { tooltip: true }
		});
	}

	$.next();
	$.reset(p);
	$.append($$anchor, p);

	return $.pop($$exports);
}