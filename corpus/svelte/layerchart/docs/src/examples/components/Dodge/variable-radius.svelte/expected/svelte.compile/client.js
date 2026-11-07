import 'svelte/internal/disclose-version';
import { getCountries2020 } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { Field, RangeField, ToggleGroup, ToggleOption } from 'svelte-ux';
import { sortFunc } from '@layerstack/utils';
import { Chart, Circle, Dodge, Tooltip } from 'layerchart';

const data = await getCountries2020();
var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="grid grid-cols-[auto_1fr_1fr] gap-4 mb-4 screenshot-hidden"><!> <!> <!></div> <!>`, 1);

export default function Variable_radius($$anchor, $$props) {
	$.push($$props, true);

	let sortOrder = $.state('unsorted');
	let minRadius = $.state(2);
	let maxRadius = $.state(20);

	const sortedData = $.derived(() => {
		if ($.get(sortOrder) === 'unsorted') return data;

		// `sortFunc` is ascending by default; pass 'desc' for largest first.
		return [...data].sort(sortFunc('population', $.get(sortOrder)));
	});

	var $$exports = { data };
	var fragment = root_2();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Field(node, {
		label: 'Sort',
		dense: true,
		children: ($$anchor, $$slotProps) => {
			ToggleGroup($$anchor, {
				variant: 'outline',
				size: 'sm',
				get value() {
					return $.get(sortOrder);
				},

				set value($$value) {
					$.set(sortOrder, $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					ToggleOption(node_1, {
						value: 'unsorted',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Unsorted');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					ToggleOption(node_2, {
						value: 'desc',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Largest first');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					ToggleOption(node_3, {
						value: 'asc',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Smallest first');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => $.get(maxRadius) - 1);

		RangeField(node_4, {
			label: 'Min radius',
			min: 1,
			get max() {
				return $.get($0);
			},

			get value() {
				return $.get(minRadius);
			},

			set value($$value) {
				$.set(minRadius, $$value, true);
			}
		});
	}

	var node_5 = $.sibling(node_4, 2);

	{
		let $0 = $.derived(() => $.get(minRadius) + 1);

		RangeField(node_5, {
			label: 'Max radius',
			get min() {
				return $.get($0);
			},
			max: 50,
			get value() {
				return $.get(maxRadius);
			},

			set value($$value) {
				$.set(maxRadius, $$value, true);
			}
		});
	}

	$.reset(div);

	var node_6 = $.sibling(div, 2);

	{
		const marks = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;

			{
				const children = ($$anchor, $$arg0) => {
					let dodged = () => ($$arg0?.()).items;
					var fragment_4 = $.comment();
					var node_7 = $.first_child(fragment_4);

					$.each(node_7, 17, dodged, ({ data: country, x, y, r, index }) => index, ($$anchor, $$item) => {
						let country = () => $.get($$item).data;
						let x = () => $.get($$item).x;
						let y = () => $.get($$item).y;
						let r = () => $.get($$item).r;
						let index = () => $.get($$item).index;

						{
							let $0 = $.derived(() => [country()]);

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
								fill: 'continent',
								class: 'stroke-surface-100 opacity-80',
								onpointermove: (e) => context().tooltip.show(e, country()),
								get onpointerleave() {
									return context().tooltip.hide;
								}
							});
						}
					});

					$.append($$anchor, fragment_4);
				};

				Dodge($$anchor, {
					axis: 'y',
					anchor: 'bottom',
					padding: 0,
					children,
					$$slots: { default: true }
				});
			}
		};

		const tooltip = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_6 = $.comment();
			var node_8 = $.first_child(fragment_6);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_7 = root_1();
					var node_9 = $.first_child(fragment_7);

					$.component(node_9, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_3 = $.text();

								$.template_effect(() => $.set_text(text_3, data().name));
								$.append($$anchor, text_3);
							},
							$$slots: { default: true }
						});
					});

					var node_10 = $.sibling(node_9, 2);

					$.component(node_10, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_9 = root();
								var node_11 = $.first_child(fragment_9);

								$.component(node_11, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
									Tooltip_Item($$anchor, {
										label: 'Continent',
										get value() {
											return data().continent;
										}
									});
								});

								var node_12 = $.sibling(node_11, 2);

								{
									let $0 = $.derived(() => data().lifeExpectancy.toFixed(1));

									$.component(node_12, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
										Tooltip_Item_1($$anchor, {
											label: 'Life expectancy',
											get value() {
												return `${$.get($0) ?? ''} years`;
											}
										});
									});
								}

								var node_13 = $.sibling(node_12, 2);

								$.component(node_13, () => Tooltip.Item, ($$anchor, Tooltip_Item_2) => {
									Tooltip_Item_2($$anchor, {
										label: 'Population',
										get value() {
											return data().population;
										},
										format: 'metric'
									});
								});

								$.append($$anchor, fragment_9);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_7);
				};

				$.component(node_8, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, {
						get context() {
							return context();
						},
						children,
						$$slots: { default: true }
					});
				});
			}

			$.append($$anchor, fragment_6);
		};

		let $0 = $.derived(() => [$.get(minRadius), $.get(maxRadius)]);

		Chart(node_6, {
			get data() {
				return $.get(sortedData);
			},
			x: 'lifeExpectancy',
			xNice: true,
			r: 'population',
			get rRange() {
				return $.get($0);
			},
			c: 'continent',
			cDomain: [
				'Africa',
				'Asia',
				'Europe',
				'North America',
				'Oceania',
				'South America'
			],
			cRange: [
				'var(--color-warning)',
				'var(--color-info)',
				'var(--color-success)',
				'var(--color-danger)',
				'var(--color-secondary)',
				'var(--color-primary)'
			],
			padding: { top: 12, bottom: 32, left: 12, right: 12 },
			height: 400,
			axis: { placement: 'bottom', rule: true },
			props: { xAxis: { label: 'Life expectancy (years)' } },
			marks,
			tooltip,
			$$slots: { marks: true, tooltip: true }
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}