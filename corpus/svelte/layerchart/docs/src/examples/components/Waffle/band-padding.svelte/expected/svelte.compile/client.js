import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Tooltip, Waffle } from 'layerchart';
import { Field, RangeField, ToggleGroup, ToggleOption } from 'svelte-ux';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="grid grid-cols-[auto_1fr] gap-4 mb-4 screenshot-hidden"><!> <!></div> <!>`, 1);

export default function Band_padding($$anchor, $$props) {
	$.push($$props, true);

	let bandPadding = $.state(0.2);
	let unit = $.state(5);

	const data = [
		{ fruit: 'Apple', count: 212 },
		{ fruit: 'Banana', count: 207 },
		{ fruit: 'Cherry', count: 315 },
		{ fruit: 'Date', count: 11 }
	];

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

					$.each(node_1, 16, () => [1, 2, 5, 10, 25, 50, 100], (opt) => opt, ($$anchor, opt) => {
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

	RangeField(node_2, {
		label: 'Band padding',
		min: 0,
		max: 0.8,
		step: 0.05,
		format: 'decimal',
		get value() {
			return $.get(bandPadding);
		},

		set value($$value) {
			$.set(bandPadding, $$value, true);
		}
	});

	$.reset(div);

	var node_3 = $.sibling(div, 2);

	{
		const marks = ($$anchor) => {
			Waffle($$anchor, {
				fill: 'var(--color-info)',
				get unit() {
					return $.get(unit);
				},
				round: true,
				tooltip: true
			});
		};

		const tooltip = ($$anchor) => {
			var fragment_6 = $.comment();
			var node_4 = $.first_child(fragment_6);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_7 = root();
					var node_5 = $.first_child(fragment_7);

					$.component(node_5, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text();

								$.template_effect(() => $.set_text(text_1, data().fruit));
								$.append($$anchor, text_1);
							},
							$$slots: { default: true }
						});
					});

					var node_6 = $.sibling(node_5, 2);

					$.component(node_6, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_9 = $.comment();
								var node_7 = $.first_child(fragment_9);

								$.component(node_7, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
									Tooltip_Item($$anchor, {
										label: 'Count',
										get value() {
											return data().count;
										},
										format: 'integer'
									});
								});

								$.append($$anchor, fragment_9);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_7);
				};

				$.component(node_4, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_6);
		};

		Chart(node_3, {
			get data() {
				return data;
			},
			x: 'fruit',
			get bandPadding() {
				return $.get(bandPadding);
			},
			y: 'count',
			yDomain: [0, null],
			yNice: true,
			padding: { left: 36, bottom: 24, top: 8, right: 8 },
			height: 400,
			rule: true,
			grid: true,
			clip: true,
			marks,
			tooltip,
			$$slots: { marks: true, tooltip: true }
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}