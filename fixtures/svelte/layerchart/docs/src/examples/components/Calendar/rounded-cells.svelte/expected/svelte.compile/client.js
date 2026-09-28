import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scaleThreshold } from 'd3-scale';
import { timeYear } from 'd3-time';
import { Calendar, Chart, Layer, Rect, Tooltip } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';
import { endOfInterval } from '@layerstack/utils';

var root = $.from_html(`<!> <!>`, 1);

export default function Rounded_cells($$anchor, $$props) {
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
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Layer(node, {
				children: ($$anchor, $$slotProps) => {
					{
						const children = ($$anchor, $$arg0) => {
							let cells = () => ($$arg0?.()).cells;
							let cellSize = () => ($$arg0?.()).cellSize;
							var fragment_3 = $.comment();
							var node_1 = $.first_child(fragment_3);

							$.each(node_1, 17, cells, $.index, ($$anchor, cell) => {
								const padding = $.derived(() => 1);

								{
									let $0 = $.derived(() => $.get(cell).x + $.get(padding));
									let $1 = $.derived(() => $.get(cell).y + $.get(padding));
									let $2 = $.derived(() => cellSize()[0] - $.get(padding) * 2);
									let $3 = $.derived(() => cellSize()[1] - $.get(padding) * 2);
									let $4 = $.derived(() => $.get(cell).color ?? 'rgb(0 0 0 / 5%)');

									Rect($$anchor, {
										get x() {
											return $.get($0);
										},

										get y() {
											return $.get($1);
										},

										get width() {
											return $.get($2);
										},

										get height() {
											return $.get($3);
										},
										rx: 4,
										get fill() {
											return $.get($4);
										},
										onpointermove: (e) => context().tooltip?.show(e, $.get(cell).data),
										onpointerleave: (e) => context().tooltip?.hide()
									});
								}
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
					var fragment_5 = root();
					var node_3 = $.first_child(fragment_5);

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
							var fragment_6 = $.comment();
							var node_5 = $.first_child(fragment_6);

							$.component(node_5, () => Tooltip.List, ($$anchor, Tooltip_List) => {
								Tooltip_List($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_7 = $.comment();
										var node_6 = $.first_child(fragment_7);

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

										$.append($$anchor, fragment_7);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_6);
						};

						$.if(node_4, ($$render) => {
							if (data().value != null) $$render(consequent);
						});
					}

					$.append($$anchor, fragment_5);
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