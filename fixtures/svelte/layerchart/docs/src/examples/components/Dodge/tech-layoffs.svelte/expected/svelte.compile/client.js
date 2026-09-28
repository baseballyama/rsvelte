import 'svelte/internal/disclose-version';
import { getLayoffs } from '$lib/data.remote';
import { sortFunc } from '@layerstack/utils';
import * as $ from 'svelte/internal/client';
import { Chart, Circle, Dodge, Text, Tooltip } from 'layerchart';

const all = await getLayoffs();
const data = [...all].filter((d) => d.totalLaidOff != null && d.totalLaidOff > 0).sort(sortFunc('totalLaidOff', 'desc'));
var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Tech_layoffs($$anchor, $$props) {
	$.push($$props, true);

	// Annotate companies with ≥5,000 announced layoffs.
	const labelThreshold = 5_000;

	var $$exports = { data };

	{
		const marks = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;

			{
				const children = ($$anchor, $$arg0) => {
					let items = () => ($$arg0?.()).items;
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					$.each(node, 17, items, ({ data: layoff, x, y, r, index }) => index, ($$anchor, $$item) => {
						let layoff = () => $.get($$item).data;
						let x = () => $.get($$item).x;
						let y = () => $.get($$item).y;
						let r = () => $.get($$item).r;
						let index = () => $.get($$item).index;

						Circle($$anchor, {
							get cx() {
								return x();
							},

							get cy() {
								return y();
							},

							get r() {
								return r();
							},
							class: 'fill-danger/30 stroke-danger',
							onpointermove: (e) => context().tooltip.show(e, layoff()),
							get onpointerleave() {
								return context().tooltip.hide;
							}
						});
					});

					var node_1 = $.sibling(node, 2);

					$.each(node_1, 17, () => items().filter((d) => d.data.totalLaidOff >= labelThreshold), ({ data: layoff, x, y, r, index }) => index, ($$anchor, $$item) => {
						let layoff = () => $.get($$item).data;
						let x = () => $.get($$item).x;
						let y = () => $.get($$item).y;
						let r = () => $.get($$item).r;
						let index = () => $.get($$item).index;

						Text($$anchor, {
							get x() {
								return x();
							},

							get y() {
								return y();
							},

							get value() {
								return layoff().company;
							},
							textAnchor: 'middle',
							verticalAnchor: 'middle',
							fontSize: 10,
							stroke: 'var(--color-surface-100)',
							strokeWidth: 3,
							class: 'pointer-events-none'
						});
					});

					$.append($$anchor, fragment_2);
				};

				Dodge($$anchor, {
					axis: 'y',
					anchor: 'bottom',
					padding: 1,
					children,
					$$slots: { default: true }
				});
			}
		};

		const tooltip = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_5 = $.comment();
			var node_2 = $.first_child(fragment_5);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_6 = root();
					var node_3 = $.first_child(fragment_6);

					$.component(node_3, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(() => $.set_text(text, data().company));
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});

					var node_4 = $.sibling(node_3, 2);

					$.component(node_4, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_8 = root_1();
								var node_5 = $.first_child(fragment_8);

								$.component(node_5, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
									Tooltip_Item($$anchor, {
										label: 'Date',
										get value() {
											return data().date;
										},
										format: 'day'
									});
								});

								var node_6 = $.sibling(node_5, 2);

								$.component(node_6, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
									Tooltip_Item_1($$anchor, {
										label: 'Laid off',
										get value() {
											return data().totalLaidOff;
										},
										format: 'integer'
									});
								});

								var node_7 = $.sibling(node_6, 2);

								{
									var consequent = ($$anchor) => {
										var fragment_9 = $.comment();
										var node_8 = $.first_child(fragment_9);

										$.component(node_8, () => Tooltip.Item, ($$anchor, Tooltip_Item_2) => {
											Tooltip_Item_2($$anchor, {
												label: 'Of workforce',
												get value() {
													return data().percentageLaidOff;
												},
												format: 'percentRound'
											});
										});

										$.append($$anchor, fragment_9);
									};

									$.if(node_7, ($$render) => {
										if (data().percentageLaidOff != null) $$render(consequent);
									});
								}

								var node_9 = $.sibling(node_7, 2);

								$.component(node_9, () => Tooltip.Item, ($$anchor, Tooltip_Item_3) => {
									Tooltip_Item_3($$anchor, {
										label: 'Industry',
										get value() {
											return data().industry;
										}
									});
								});

								var node_10 = $.sibling(node_9, 2);

								$.component(node_10, () => Tooltip.Item, ($$anchor, Tooltip_Item_4) => {
									Tooltip_Item_4($$anchor, {
										label: 'Location',
										get value() {
											return data().location;
										}
									});
								});

								$.append($$anchor, fragment_8);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_6);
				};

				$.component(node_2, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, {
						get context() {
							return context();
						},
						children,
						$$slots: { default: true }
					});
				});
			}

			$.append($$anchor, fragment_5);
		};

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			r: 'totalLaidOff',
			rRange: [1, 20],
			padding: { top: 12, bottom: 24, left: 12, right: 12 },
			height: 1000,
			axis: { placement: 'bottom', rule: true },
			marks,
			tooltip,
			$$slots: { marks: true, tooltip: true }
		});
	}

	return $.pop($$exports);
}