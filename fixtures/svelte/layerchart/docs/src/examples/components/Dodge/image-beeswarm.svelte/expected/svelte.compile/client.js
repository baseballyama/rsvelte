import 'svelte/internal/disclose-version';
import { getUsPresidents } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { Chart, Dodge, Image, Tooltip } from 'layerchart';

const data = await getUsPresidents();
var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Image_beeswarm($$anchor, $$props) {
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

					$.each(node, 17, items, ({ data: p, x, y, r, index }) => index, ($$anchor, $$item) => {
						let p = () => $.get($$item).data;
						let x = () => $.get($$item).x;
						let y = () => $.get($$item).y;
						let r = () => $.get($$item).r;
						let index = () => $.get($$item).index;

						Image($$anchor, {
							get href() {
								return p().portraitUrl;
							},

							get x() {
								return x();
							},

							get y() {
								return y();
							},

							get r() {
								return r();
							},
							preserveAspectRatio: 'xMidYMid slice',
							class: 'cursor-pointer',
							onpointermove: (e) => context().tooltip.show(e, p()),
							get onpointerleave() {
								return context().tooltip.hide;
							}
						});
					});

					$.append($$anchor, fragment_2);
				};

				Dodge($$anchor, {
					axis: 'y',
					anchor: 'bottom',
					r: 18,
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
										label: 'Inaugurated',
										get value() {
											return data().inaugurationDate;
										},
										format: 'day'
									});
								});

								var node_5 = $.sibling(node_4, 2);

								$.component(node_5, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
									Tooltip_Item_1($$anchor, {
										label: 'Very favorable',
										get value() {
											return `${data().veryFavorable ?? ''}%`;
										}
									});
								});

								var node_6 = $.sibling(node_5, 2);

								$.component(node_6, () => Tooltip.Item, ($$anchor, Tooltip_Item_2) => {
									Tooltip_Item_2($$anchor, {
										label: 'Very unfavorable',
										get value() {
											return `${data().veryUnfavorable ?? ''}%`;
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
			x: 'inaugurationDate',
			xNice: true,
			padding: { top: 12, bottom: 24, left: 12, right: 12 },
			height: 420,
			marks,
			tooltip,
			$$slots: { marks: true, tooltip: true }
		});
	}

	return $.pop($$exports);
}