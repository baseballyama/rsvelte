import 'svelte/internal/disclose-version';
import { getUsEvents } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { Chart, Dodge, Rect, Tooltip } from 'layerchart';
import { Duration } from 'svelte-ux';

const data = await getUsEvents();
var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Duration_bars_dense_lanes($$anchor, $$props) {
	$.push($$props, true);

	var $$exports = { data };

	{
		const marks = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			const rowHeight = $.derived(() => 40);
			const rowPadding = $.derived(() => 10);
			const barHeight = $.derived(() => $.get(rowHeight) - $.get(rowPadding));
			const startX = $.derived(() => (d) => context().xScale(d.startDate));
			const endX = $.derived(() => (d) => context().xScale(d.endDate));

			{
				const children = ($$anchor, $$arg0) => {
					let items = () => ($$arg0?.()).items;
					var fragment_2 = $.comment();
					var node = $.first_child(fragment_2);

					$.each(node, 17, items, ({ data: ev, y, index }) => index, ($$anchor, $$item) => {
						let ev = () => $.get($$item).data;
						let y = () => $.get($$item).y;
						let index = () => $.get($$item).index;

						{
							let $0 = $.derived(() => $.get(startX)(ev()));
							let $1 = $.derived(() => y() - $.get(barHeight) / 2);
							let $2 = $.derived(() => $.get(endX)(ev()) - $.get(startX)(ev()));

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
								height: $.get(barHeight),
								rx: 3,
								class: 'fill-primary',
								onpointermove: (e) => context().tooltip.show(e, ev()),
								get onpointerleave() {
									return context().tooltip.hide;
								}
							});
						}
					});

					$.append($$anchor, fragment_2);
				};

				Dodge($$anchor, {
					get data() {
						return data;
					},
					axis: 'y',
					anchor: 'top',
					padding: 2,
					rx: (d) => ($.get(endX)(d) - $.get(startX)(d)) / 2,
					ry: $.get(rowHeight) / 2,
					position: (d) => ($.get(startX)(d) + $.get(endX)(d)) / 2,
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

								$.template_effect(() => $.set_text(text, data().event));
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
										label: 'start',
										get value() {
											return data().startDate;
										},
										valueAlign: 'right',
										format: 'day'
									});
								});

								var node_5 = $.sibling(node_4, 2);

								$.component(node_5, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
									Tooltip_Item_1($$anchor, {
										label: 'end',
										get value() {
											return data().endDate;
										},
										valueAlign: 'right',
										format: 'day'
									});
								});

								var node_6 = $.sibling(node_5, 2);

								$.component(node_6, () => Tooltip.Separator, ($$anchor, Tooltip_Separator) => {
									Tooltip_Separator($$anchor, {});
								});

								var node_7 = $.sibling(node_6, 2);

								$.component(node_7, () => Tooltip.Item, ($$anchor, Tooltip_Item_2) => {
									Tooltip_Item_2($$anchor, {
										label: 'duration',
										valueAlign: 'right',
										children: ($$anchor, $$slotProps) => {
											Duration($$anchor, {
												get start() {
													return data().startDate;
												},

												get end() {
													return data().endDate;
												},
												totalUnits: 2
											});
										},
										$$slots: { default: true }
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
			x: ['startDate', 'endDate'],
			xNice: true,
			padding: { top: 12, bottom: 24, left: 10, right: 25 },
			height: 300,
			axis: 'x',
			grid: { x: true },
			props: { tooltip: { context: { mode: 'bounds' } } },
			marks,
			tooltip,
			$$slots: { marks: true, tooltip: true }
		});
	}

	return $.pop($$exports);
}