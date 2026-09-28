import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Tooltip, Waffle } from 'layerchart';
import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="grid grid-cols-[auto_auto_1fr] gap-4 mb-4 screenshot-hidden"><!> <!> <!></div> <!>`, 1);

export default function Unit_multiple($$anchor, $$props) {
	$.push($$props, true);

	let unit = $.state(10);
	let multiple = $.state(undefined);
	let round = $.state(false);

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

	Field(node_2, {
		label: 'Multiple',
		dense: true,
		children: ($$anchor, $$slotProps) => {
			ToggleGroup($$anchor, {
				variant: 'outline',
				size: 'sm',
				get value() {
					return $.get(multiple);
				},

				set value($$value) {
					$.set(multiple, $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_6 = root();
					var node_3 = $.first_child(fragment_6);

					ToggleOption(node_3, {
						value: undefined,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('unset');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_3, 2);

					$.each(node_4, 16, () => [1, 2, 5, 10], (opt) => opt, ($$anchor, opt) => {
						ToggleOption($$anchor, {
							get value() {
								return opt;
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_2 = $.text();

								$.template_effect(() => $.set_text(text_2, opt));
								$.append($$anchor, text_2);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_6);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_2, 2);

	Field(node_5, {
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
					var fragment_10 = root();
					var node_6 = $.first_child(fragment_10);

					ToggleOption(node_6, {
						value: false,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Off');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_6, 2);

					ToggleOption(node_7, {
						value: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('On');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_10);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var node_8 = $.sibling(div, 2);

	{
		const marks = ($$anchor) => {
			Waffle($$anchor, {
				fill: 'var(--color-info)',
				get unit() {
					return $.get(unit);
				},

				get multiple() {
					return $.get(multiple);
				},

				get round() {
					return $.get(round);
				},
				tooltip: true
			});
		};

		const tooltip = ($$anchor) => {
			var fragment_12 = $.comment();
			var node_9 = $.first_child(fragment_12);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_13 = root();
					var node_10 = $.first_child(fragment_13);

					$.component(node_10, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_5 = $.text();

								$.template_effect(() => $.set_text(text_5, data().fruit));
								$.append($$anchor, text_5);
							},
							$$slots: { default: true }
						});
					});

					var node_11 = $.sibling(node_10, 2);

					$.component(node_11, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_15 = $.comment();
								var node_12 = $.first_child(fragment_15);

								$.component(node_12, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
									Tooltip_Item($$anchor, {
										label: 'Count',
										get value() {
											return data().count;
										},
										format: 'integer'
									});
								});

								$.append($$anchor, fragment_15);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_13);
				};

				$.component(node_9, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_12);
		};

		Chart(node_8, {
			get data() {
				return data;
			},
			x: 'fruit',
			bandPadding: 0.2,
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