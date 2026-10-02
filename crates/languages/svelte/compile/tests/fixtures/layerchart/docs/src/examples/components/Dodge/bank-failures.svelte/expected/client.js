import 'svelte/internal/disclose-version';
import { getBankFailures } from '$lib/data.remote';
import { sortFunc } from '@layerstack/utils';
import * as $ from 'svelte/internal/client';
import { scaleSqrt } from 'd3-scale';
import { Chart, Circle, Dodge, Text, Tooltip } from 'layerchart';

const all = await getBankFailures();
const data = [...all].sort(sortFunc('assets', 'desc'));
var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Bank_failures($$anchor, $$props) {
	$.push($$props, true);

	// Threshold (in $thousands) above which we annotate each circle with the bank name.
	const labelThreshold = 25_000_000; // $25B+

	const dollars = (thousands) => {
		const dollars = thousands * 1_000;

		if (dollars >= 1e12) return (dollars / 1e12).toFixed(1) + 'T';
		if (dollars >= 1e9) return (dollars / 1e9).toFixed(1) + 'B';
		if (dollars >= 1e6) return (dollars / 1e6).toFixed(0) + 'M';

		return dollars.toLocaleString();
	};

	const titleCase = (s) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
	var $$exports = { data };

	{
		const marks = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;

			{
				const children = ($$anchor, $$arg0) => {
					let items = () => ($$arg0?.()).items;
					var fragment_2 = $.comment();
					var node = $.first_child(fragment_2);

					$.each(node, 17, items, ({ data: bank, x, y, r, index }) => index, ($$anchor, $$item) => {
						let bank = () => $.get($$item).data;
						let x = () => $.get($$item).x;
						let y = () => $.get($$item).y;
						let r = () => $.get($$item).r;
						let index = () => $.get($$item).index;
						var fragment_3 = root();
						var node_1 = $.first_child(fragment_3);

						Circle(node_1, {
							get cx() {
								return x();
							},

							get cy() {
								return y();
							},

							get r() {
								return r();
							},
							class: 'fill-surface-content/15 stroke-surface-content/60',
							onpointermove: (e) => context().tooltip.show(e, bank()),
							get onpointerleave() {
								return context().tooltip.hide;
							}
						});

						var node_2 = $.sibling(node_1, 2);

						{
							var consequent = ($$anchor) => {
								{
									let $0 = $.derived(() => titleCase(bank().name));

									Text($$anchor, {
										get x() {
											return x();
										},

										get y() {
											return y();
										},

										get value() {
											return $.get($0);
										},
										textAnchor: 'middle',
										verticalAnchor: 'middle',
										fontSize: 10,
										class: 'fill-surface-content pointer-events-none'
									});
								}
							};

							$.if(node_2, ($$render) => {
								if (bank().assets >= labelThreshold) $$render(consequent);
							});
						}

						$.append($$anchor, fragment_3);
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
			var node_3 = $.first_child(fragment_5);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_6 = root();
					var node_4 = $.first_child(fragment_6);

					$.component(node_4, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(($0) => $.set_text(text, $0), [() => titleCase(data().name)]);
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});

					var node_5 = $.sibling(node_4, 2);

					$.component(node_5, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_8 = root_1();
								var node_6 = $.first_child(fragment_8);

								$.component(node_6, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
									Tooltip_Item($$anchor, {
										label: 'Failed',
										get value() {
											return data().failDate;
										},
										format: 'day'
									});
								});

								var node_7 = $.sibling(node_6, 2);

								{
									let $0 = $.derived(() => dollars(data().assets));

									$.component(node_7, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
										Tooltip_Item_1($$anchor, {
											label: 'Assets',
											get value() {
												return `$${$.get($0) ?? ''}`;
											}
										});
									});
								}

								var node_8 = $.sibling(node_7, 2);

								{
									let $0 = $.derived(() => dollars(data().deposits));

									$.component(node_8, () => Tooltip.Item, ($$anchor, Tooltip_Item_2) => {
										Tooltip_Item_2($$anchor, {
											label: 'Deposits',
											get value() {
												return `$${$.get($0) ?? ''}`;
											}
										});
									});
								}

								var node_9 = $.sibling(node_8, 2);

								$.component(node_9, () => Tooltip.Item, ($$anchor, Tooltip_Item_3) => {
									Tooltip_Item_3($$anchor, {
										label: 'Location',
										get value() {
											return `${data().city ?? ''}, ${data().state ?? ''}`;
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

				$.component(node_3, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
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

		let $0 = $.derived(scaleSqrt);

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: 'failDate',
			r: 'assets',
			get rScale() {
				return $.get($0);
			},
			rRange: [2, 30],
			padding: { top: 12, bottom: 24, left: 12, right: 12 },
			height: 2800,
			axis: {
				placement: 'bottom',
				rule: true,
				format: (d) => d.getUTCFullYear().toString()
			},
			marks,
			tooltip,
			$$slots: { marks: true, tooltip: true }
		});
	}

	return $.pop($$exports);
}