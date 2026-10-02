import 'svelte/internal/disclose-version';
import { getPenguins } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { Chart, Circle, Dodge, Tooltip } from 'layerchart';

const data = await getPenguins();
var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Grouped_vertical($$anchor, $$props) {
	$.push($$props, true);

	var $$exports = { data };

	{
		const marks = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			const bandwidth = $.derived(() => context().xScale.bandwidth?.() ?? 0);
			const visibleSeries = $.derived(() => context().series.visibleSeries);
			const visibleKeys = $.derived(() => new Set($.get(visibleSeries).map((s) => s.key)));
			const visibleData = $.derived(() => data.filter((d) => $.get(visibleKeys).has(d.sex)));
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.each(node, 16, () => context().xDomain, (s) => s, ($$anchor, s) => {
				const bandLeft = $.derived(() => context().xScale(s) ?? 0);
				const items = $.derived(() => $.get(visibleData).filter((d) => d.species === s));

				{
					const children = ($$anchor, $$arg0) => {
						let dodged = () => ($$arg0?.()).items;
						var fragment_3 = $.comment();
						var node_1 = $.first_child(fragment_3);

						$.each(node_1, 17, dodged, ({ data: p, x, y, r, index }) => index, ($$anchor, $$item) => {
							let p = () => $.get($$item).data;
							let x = () => $.get($$item).x;
							let y = () => $.get($$item).y;
							let r = () => $.get($$item).r;
							let index = () => $.get($$item).index;
							const series = $.derived(() => $.get(visibleSeries).find((vs) => vs.key === p().sex));
							const opacity = $.derived(() => context().series.isHighlighted(p().sex, true) ? 1 : 0.2);

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

						$.append($$anchor, fragment_3);
					};

					let $0 = $.derived(() => $.get(bandLeft) + $.get(bandwidth) / 2);

					Dodge($$anchor, {
						get data() {
							return $.get(items);
						},
						axis: 'x',
						anchor: 'middle',
						get baseline() {
							return $.get($0);
						},
						r: 3,
						padding: 1,
						position: (d) => Number(context().yGet(d)) || 0,
						children,
						$$slots: { default: true }
					});
				}
			});

			$.append($$anchor, fragment_1);
		};

		const tooltip = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_5 = $.comment();
			var node_2 = $.first_child(fragment_5);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_6 = root_1();
					var node_3 = $.first_child(fragment_6);

					$.component(node_3, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
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

					var node_4 = $.sibling(node_3, 2);

					$.component(node_4, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_8 = root();
								var node_5 = $.first_child(fragment_8);

								$.component(node_5, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
									Tooltip_Item($$anchor, {
										label: 'Body mass',
										get value() {
											return `${data().body_mass_g ?? ''} g`;
										}
									});
								});

								var node_6 = $.sibling(node_5, 2);

								$.component(node_6, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
									Tooltip_Item_1($$anchor, {
										label: 'Sex',
										get value() {
											return data().sex;
										}
									});
								});

								var node_7 = $.sibling(node_6, 2);

								$.component(node_7, () => Tooltip.Item, ($$anchor, Tooltip_Item_2) => {
									Tooltip_Item_2($$anchor, {
										label: 'Island',
										get value() {
											return data().island;
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
			x: 'species',
			bandPadding: 0.2,
			y: 'body_mass_g',
			yNice: true,
			series: [
				{
					key: 'female',
					label: 'Female',
					color: 'var(--color-warning)'
				},
				{ key: 'male', label: 'Male', color: 'var(--color-info)' }
			],
			seriesLayout: 'overlap',
			padding: { top: 12, bottom: 24, left: 40, right: 12 },
			height: 400,
			legend: { placement: 'top', variant: 'swatches' },
			marks,
			tooltip,
			$$slots: { marks: true, tooltip: true }
		});
	}

	return $.pop($$exports);
}