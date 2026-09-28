import 'svelte/internal/disclose-version';
import { getUsSenators } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { Chart, Circle, Dodge, Tooltip } from 'layerchart';

const data = await getUsSenators();
var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Beeswarm($$anchor, $$props) {
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

					$.each(node, 17, items, ({ data: senator, x, y, r, index }) => index, ($$anchor, $$item) => {
						let senator = () => $.get($$item).data;
						let x = () => $.get($$item).x;
						let y = () => $.get($$item).y;
						let r = () => $.get($$item).r;
						let index = () => $.get($$item).index;

						{
							let $0 = $.derived(() => [senator()]);

							Circle($$anchor, {
								get data() {
									return $.get($0);
								},

								get cx() {
									return x();
								},

								get cy() {
									return y();
								},

								get r() {
									return r();
								},
								fill: 'gender',
								class: 'stroke-surface-100',
								onpointermove: (e) => context().tooltip.show(e, senator()),
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
					r: 6,
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
										label: 'Birth date',
										get value() {
											return data().date_of_birth;
										},
										format: 'day'
									});
								});

								var node_5 = $.sibling(node_4, 2);

								$.component(node_5, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
									Tooltip_Item_1($$anchor, {
										label: 'State',
										get value() {
											return data().state_name;
										}
									});
								});

								var node_6 = $.sibling(node_5, 2);

								$.component(node_6, () => Tooltip.Item, ($$anchor, Tooltip_Item_2) => {
									Tooltip_Item_2($$anchor, {
										label: 'Party',
										get value() {
											return data().party;
										}
									});
								});

								var node_7 = $.sibling(node_6, 2);

								$.component(node_7, () => Tooltip.Item, ($$anchor, Tooltip_Item_3) => {
									Tooltip_Item_3($$anchor, {
										label: 'Gender',
										get value() {
											return data().gender;
										}
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
			x: (d) => d.date_of_birth.getFullYear(),
			xNice: true,
			c: 'gender',
			cRange: ['var(--color-info)', 'var(--color-warning)'],
			padding: { bottom: 20, left: 12, right: 12 },
			height: 300,
			axis: 'x',
			props: { xAxis: { format: 'none' } },
			marks,
			tooltip,
			$$slots: { marks: true, tooltip: true }
		});
	}

	return $.pop($$exports);
}