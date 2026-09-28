import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scaleThreshold } from 'd3-scale';
import { timeYear } from 'd3-time';
import { Calendar, Chart, Layer, Tooltip } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';
import { endOfInterval } from '@layerstack/utils';

var root = $.from_html(`<div class="absolute p-px"><div class="w-full h-full rounded-sm"></div></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Html_with_padding($$anchor, $$props) {
	$.push($$props, true);

	const now = new Date();
	const firstDayOfYear = timeYear.floor(now);
	const lastDayOfYear = endOfInterval('year', now);

	const data = createDateSeries({ count: 365 * 4, min: 10, max: 100, value: 'integer' }).map((d) => {
		return {
			...d,
			value: Math.random() > 0.2 ? d.value : null // set null for some values
		};
	});

	var $$exports = { data };

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			Layer(node, {
				type: 'html',
				children: ($$anchor, $$slotProps) => {
					{
						const children = ($$anchor, $$arg0) => {
							let cells = () => ($$arg0?.()).cells;
							let cellSize = () => ($$arg0?.()).cellSize;
							var fragment_3 = $.comment();
							var node_1 = $.first_child(fragment_3);

							$.each(node_1, 17, cells, $.index, ($$anchor, cell) => {
								var div = root();
								let styles;
								var div_1 = $.child(div);
								let styles_1;

								$.reset(div);

								$.template_effect(() => {
									styles = $.set_style(div, '', styles, {
										left: `${$.get(cell).x ?? ''}px`,
										top: `${$.get(cell).y ?? ''}px`,
										width: `${cellSize()[0] ?? ''}px`,
										height: `${cellSize()[1] ?? ''}px`
									});

									styles_1 = $.set_style(div_1, '', styles_1, { 'background-color': $.get(cell).color ?? 'rgb(0 0 0 / 5%)' });
								});

								$.delegated('pointermove', div, (e) => context().tooltip?.show(e, $.get(cell).data));
								$.event('pointerleave', div, (e) => context().tooltip?.hide());
								$.append($$anchor, div);
							});

							$.append($$anchor, fragment_3);
						};

						Calendar($$anchor, {
							get start() {
								return firstDayOfYear;
							},

							get end() {
								return lastDayOfYear;
							},
							children,
							$$slots: { default: true }
						});
					}
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_4 = root_1();
					var node_3 = $.first_child(fragment_4);

					$.component(node_3, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							get value() {
								return data().date;
							},
							format: 'day'
						});
					});

					var node_4 = $.sibling(node_3, 2);

					{
						var consequent = ($$anchor) => {
							var fragment_5 = $.comment();
							var node_5 = $.first_child(fragment_5);

							$.component(node_5, () => Tooltip.List, ($$anchor, Tooltip_List) => {
								Tooltip_List($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = $.comment();
										var node_6 = $.first_child(fragment_6);

										$.component(node_6, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
											Tooltip_Item($$anchor, {
												label: 'value',
												get value() {
													return data().value;
												},
												format: 'integer',
												valueAlign: 'right'
											});
										});

										$.append($$anchor, fragment_6);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_5);
						};

						$.if(node_4, ($$render) => {
							if (data().value != null) $$render(consequent);
						});
					}

					$.append($$anchor, fragment_4);
				};

				$.component(node_2, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(scaleThreshold);

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			c: 'value',
			get cScale() {
				return $.get($0);
			},
			cDomain: [25, 50, 75],
			cRange: [
				'var(--color-primary-100)',
				'var(--color-primary-300)',
				'var(--color-primary-500)',
				'var(--color-primary-700)'
			],
			padding: { top: 20 },
			height: 140,
			children,
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}

$.delegate(['pointermove']);