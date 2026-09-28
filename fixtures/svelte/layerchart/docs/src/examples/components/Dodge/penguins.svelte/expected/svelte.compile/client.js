import 'svelte/internal/disclose-version';
import { getPenguins } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { Chart, Circle, Dodge, Tooltip } from 'layerchart';

const penguins = await getPenguins();
var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Penguins($$anchor, $$props) {
	$.push($$props, true);

	const data = penguins.filter((d) => d.body_mass_g != null);
	var $$exports = { data };

	{
		const marks = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			const visibleSeries = $.derived(() => context().series.visibleSeries);
			const visibleKeys = $.derived(() => new Set($.get(visibleSeries).map((s) => s.key)));
			const visibleItems = $.derived(() => data.filter((d) => $.get(visibleKeys).has(d.species)));

			{
				const children = ($$anchor, $$arg0) => {
					let dodged = () => ($$arg0?.()).items;
					var fragment_2 = $.comment();
					var node = $.first_child(fragment_2);

					$.each(node, 17, dodged, ({ data: p, x, y, r, index }) => index, ($$anchor, $$item) => {
						let p = () => $.get($$item).data;
						let x = () => $.get($$item).x;
						let y = () => $.get($$item).y;
						let r = () => $.get($$item).r;
						let index = () => $.get($$item).index;
						const series = $.derived(() => $.get(visibleSeries).find((s) => s.key === p().species));
						const opacity = $.derived(() => context().series.isHighlighted(p().species, true) ? 1 : 0.2);

						{
							let $0 = $.derived(() => $.get(series)?.color);

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

								get fill() {
									return $.get($0);
								},

								get opacity() {
									return $.get(opacity);
								},
								class: 'stroke-surface-100',
								onpointermove: (e) => context().tooltip.show(e, p()),
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
						return $.get(visibleItems);
					},
					axis: 'y',
					anchor: 'bottom',
					r: 4,
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

								$.template_effect(() => $.set_text(text, data().species));
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
										label: 'Body mass',
										get value() {
											return `${data().body_mass_g ?? ''} g`;
										}
									});
								});

								var node_5 = $.sibling(node_4, 2);

								$.component(node_5, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
									Tooltip_Item_1($$anchor, {
										label: 'Flipper length',
										get value() {
											return `${data().flipper_length_mm ?? ''} mm`;
										}
									});
								});

								var node_6 = $.sibling(node_5, 2);

								{
									let $0 = $.derived(() => data().sex ?? 'unknown');

									$.component(node_6, () => Tooltip.Item, ($$anchor, Tooltip_Item_2) => {
										Tooltip_Item_2($$anchor, {
											label: 'Sex',
											get value() {
												return $.get($0);
											}
										});
									});
								}

								var node_7 = $.sibling(node_6, 2);

								$.component(node_7, () => Tooltip.Item, ($$anchor, Tooltip_Item_3) => {
									Tooltip_Item_3($$anchor, {
										label: 'Island',
										get value() {
											return data().island;
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
			x: 'body_mass_g',
			xNice: true,
			series: [
				{ key: 'Adelie', label: 'Adelie', color: 'var(--color-info)' },
				{
					key: 'Chinstrap',
					label: 'Chinstrap',
					color: 'var(--color-success)'
				},

				{
					key: 'Gentoo',
					label: 'Gentoo',
					color: 'var(--color-warning)'
				}
			],
			padding: { top: 20, bottom: 32, left: 12, right: 12 },
			height: 320,
			axis: 'x',
			legend: { placement: 'top', variant: 'swatches' },
			props: { xAxis: { label: 'Body mass (g)' } },
			marks,
			tooltip,
			$$slots: { marks: true, tooltip: true }
		});
	}

	return $.pop($$exports);
}