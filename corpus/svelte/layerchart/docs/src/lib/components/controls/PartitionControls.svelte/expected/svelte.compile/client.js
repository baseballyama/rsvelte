import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Field, RangeField, ToggleGroup, ToggleOption, Switch } from 'svelte-ux';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="grid grid-cols-4 gap-2 mt-2"><!></div>`);
var root_3 = $.from_html(`<div class="grid grid-cols-[2fr_1fr_1fr_1fr] gap-2 screenshot-hidden"><!> <!> <!> <!></div> <!>`, 1);

export default function PartitionControls($$anchor, $$props) {
	$.push($$props, true);

	let padding = $.prop($$props, 'padding', 15, 0),
		fullSizeLeafNodes = $.prop($$props, 'fullSizeLeafNodes', 15, false),
		round = $.prop($$props, 'round', 15, false),
		colorBy = $.prop($$props, 'colorBy', 15, 'children'),
		isFiltered = $.prop($$props, 'isFiltered', 15, undefined);

	var fragment = root_3();
	var div = $.first_child(fragment);
	var node = $.child(div);

	RangeField(node, {
		label: 'Padding',
		max: 20,
		get value() {
			return padding();
		},

		set value($$value) {
			padding($$value);
		}
	});

	var node_1 = $.sibling(node, 2);

	Field(node_1, {
		label: 'Full-size Leaf Nodes',
		children: ($$anchor, $$slotProps) => {
			ToggleGroup($$anchor, {
				variant: 'outline',
				size: 'sm',
				inset: true,
				class: 'w-full',
				get value() {
					return fullSizeLeafNodes();
				},

				set value($$value) {
					fullSizeLeafNodes($$value);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_2 = $.first_child(fragment_2);

					ToggleOption(node_2, {
						value: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Yes');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					ToggleOption(node_3, {
						value: false,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('No');

							$.append($$anchor, text_1);
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

	var node_4 = $.sibling(node_1, 2);

	Field(node_4, {
		label: 'Round',
		children: ($$anchor, $$slotProps) => {
			ToggleGroup($$anchor, {
				variant: 'outline',
				size: 'sm',
				inset: true,
				class: 'w-full',
				get value() {
					return round();
				},

				set value($$value) {
					round($$value);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root();
					var node_5 = $.first_child(fragment_4);

					ToggleOption(node_5, {
						value: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Yes');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_5, 2);

					ToggleOption(node_6, {
						value: false,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('No');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_4, 2);

	Field(node_7, {
		label: 'Color By',
		children: ($$anchor, $$slotProps) => {
			ToggleGroup($$anchor, {
				variant: 'outline',
				size: 'sm',
				inset: true,
				class: 'w-full',
				get value() {
					return colorBy();
				},

				set value($$value) {
					colorBy($$value);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_6 = root_1();
					var node_8 = $.first_child(fragment_6);

					ToggleOption(node_8, {
						value: 'children',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Children');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					var node_9 = $.sibling(node_8, 2);

					ToggleOption(node_9, {
						value: 'depth',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('Depth');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});

					var node_10 = $.sibling(node_9, 2);

					ToggleOption(node_10, {
						value: 'parent',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text('Parent');

							$.append($$anchor, text_6);
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

	var node_11 = $.sibling(div, 2);

	{
		var consequent = ($$anchor) => {
			var div_1 = root_2();
			var node_12 = $.child(div_1);

			Field(node_12, {
				label: 'Apply Partial Filter',
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const id = $.derived(() => $$slotProps.id);

						Switch($$anchor, {
							get id() {
								return $.get(id);
							},

							get checked() {
								return isFiltered();
							},

							set checked($$value) {
								isFiltered($$value);
							}
						});
					}
				}
			});

			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		$.if(node_11, ($$render) => {
			if (isFiltered() !== undefined) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}