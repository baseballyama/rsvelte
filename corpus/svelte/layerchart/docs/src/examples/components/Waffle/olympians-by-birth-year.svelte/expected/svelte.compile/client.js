import 'svelte/internal/disclose-version';
import { getOlympians } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { Chart, Tooltip, Waffle } from 'layerchart';
import { rollup } from 'd3-array';
import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';

const olympians = await getOlympians();
var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="grid grid-cols-[auto_auto_1fr] gap-4 mb-4 screenshot-hidden"><!> <!></div> <!>`, 1);

export default function Olympians_by_birth_year($$anchor, $$props) {
	$.push($$props, true);

	let unit = $.state(50);
	let round = $.state(false);
	const unitOptions = [1, 2, 5, 10, 25, 50, 100];

	// Bin athletes by 5-year birth periods (1980, 1985, 1990, ...)
	const data = Array.from(
		rollup(olympians.filter((d) => d.date_of_birth), (v) => v.length, (d) => {
			const year = new Date(d.date_of_birth).getUTCFullYear();

			return Math.floor(year / 5) * 5;
		}),
		([year, count]) => ({ year, count })
	).sort((a, b) => a.year - b.year);

	var $$exports = { data };
	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Field(node, {
		label: 'Cells per unit',
		dense: true,
		children: ($$anchor, $$slotProps) => {
			ToggleGroup($$anchor, {
				variant: 'outline',
				size: 'sm',
				get value() {
					return $.get(unit);
				},

				set value($$value) {
					$.set(unit, $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					$.each(node_1, 16, () => unitOptions, (opt) => opt, ($$anchor, opt) => {
						ToggleOption($$anchor, {
							get value() {
								return opt;
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(() => $.set_text(text, opt));
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 2);

	Field(node_2, {
		label: 'Round',
		dense: true,
		children: ($$anchor, $$slotProps) => {
			ToggleGroup($$anchor, {
				variant: 'outline',
				size: 'sm',
				get value() {
					return $.get(round);
				},

				set value($$value) {
					$.set(round, $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_6 = root();
					var node_3 = $.first_child(fragment_6);

					ToggleOption(node_3, {
						value: false,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Off');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_3, 2);

					ToggleOption(node_4, {
						value: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('On');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_6);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var node_5 = $.sibling(div, 2);

	{
		const marks = ($$anchor) => {
			Waffle($$anchor, {
				fill: 'var(--color-info)',
				get unit() {
					return $.get(unit);
				},

				get round() {
					return $.get(round);
				},
				tooltip: true
			});
		};

		const tooltip = ($$anchor) => {
			var fragment_8 = $.comment();
			var node_6 = $.first_child(fragment_8);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_9 = root();
					var node_7 = $.first_child(fragment_9);

					$.component(node_7, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_3 = $.text();

								$.template_effect(() => $.set_text(text_3, `${data().year ?? ''}–${data().year + 4}`));
								$.append($$anchor, text_3);
							},
							$$slots: { default: true }
						});
					});

					var node_8 = $.sibling(node_7, 2);

					$.component(node_8, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_11 = $.comment();
								var node_9 = $.first_child(fragment_11);

								$.component(node_9, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
									Tooltip_Item($$anchor, {
										label: 'Athletes',
										get value() {
											return data().count;
										},
										format: 'integer'
									});
								});

								$.append($$anchor, fragment_11);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_9);
				};

				$.component(node_6, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_8);
		};

		Chart(node_5, {
			get data() {
				return data;
			},
			x: 'year',
			bandPadding: 0.2,
			y: 'count',
			yDomain: [0, null],
			yNice: true,
			padding: { left: 36, bottom: 24, top: 8, right: 8 },
			height: 400,
			rule: true,
			grid: true,
			marks,
			tooltip,
			$$slots: { marks: true, tooltip: true }
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}