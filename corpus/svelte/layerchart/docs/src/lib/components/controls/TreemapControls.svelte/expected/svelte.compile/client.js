import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Field, RangeField, Switch, ToggleGroup, ToggleOption } from 'svelte-ux';

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<div class="grid grid-cols-4 gap-2"><!></div>`);
var root_4 = $.from_html(`<div class="grid gap-2 mb-2 screenshot-hidden"><div class="grid grid-cols-[6fr_1fr_3fr] gap-2"><!> <!> <!></div> <div class="grid grid-cols-2 gap-2"><!> <!></div> <div class="grid grid-cols-4 gap-2"><!> <!> <!> <!></div> <!></div>`);

export default function TreemapControls($$anchor, $$props) {
	$.push($$props, true);

	let config = $.prop($$props, 'config', 31, () => $.proxy({
		tile: 'squarify',
		colorBy: 'children',
		maintainAspectRatio: false,
		paddingOuter: 4,
		paddingInner: 4,
		paddingTop: 20,
		paddingBottom: 0,
		paddingLeft: 0,
		paddingRight: 0,
		isFiltered: undefined
	}));

	var div = root_4();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Field(node, {
		label: 'Tile',
		children: ($$anchor, $$slotProps) => {
			ToggleGroup($$anchor, {
				variant: 'outline',
				size: 'sm',
				inset: true,
				class: 'w-full',
				get value() {
					return config().tile;
				},

				set value($$value) {
					config(config().tile = $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_1 = $.first_child(fragment_1);

					ToggleOption(node_1, {
						value: 'squarify',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Squarify');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					ToggleOption(node_2, {
						value: 'resquarify',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Resquarify');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					ToggleOption(node_3, {
						value: 'binary',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Binary');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_3, 2);

					ToggleOption(node_4, {
						value: 'slice',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Slice');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					ToggleOption(node_5, {
						value: 'dice',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Dice');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_5, 2);

					ToggleOption(node_6, {
						value: 'sliceDice',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('Slice / Dice');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node, 2);

	Field(node_7, {
		label: 'Maintain Aspect Ratio',
		children: ($$anchor, $$slotProps) => {
			ToggleGroup($$anchor, {
				variant: 'outline',
				size: 'sm',
				inset: true,
				class: 'w-full',
				get value() {
					return config().maintainAspectRatio;
				},

				set value($$value) {
					config(config().maintainAspectRatio = $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_1();
					var node_8 = $.first_child(fragment_3);

					ToggleOption(node_8, {
						value: false,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text('No');

							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});

					var node_9 = $.sibling(node_8, 2);

					ToggleOption(node_9, {
						value: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text('Yes');

							$.append($$anchor, text_7);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_7, 2);

	Field(node_10, {
		label: 'Color By',
		children: ($$anchor, $$slotProps) => {
			ToggleGroup($$anchor, {
				variant: 'outline',
				size: 'sm',
				inset: true,
				class: 'w-full',
				get value() {
					return config().colorBy;
				},

				set value($$value) {
					config(config().colorBy = $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_5 = root_2();
					var node_11 = $.first_child(fragment_5);

					ToggleOption(node_11, {
						value: 'children',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_8 = $.text('Children');

							$.append($$anchor, text_8);
						},
						$$slots: { default: true }
					});

					var node_12 = $.sibling(node_11, 2);

					ToggleOption(node_12, {
						value: 'depth',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_9 = $.text('Depth');

							$.append($$anchor, text_9);
						},
						$$slots: { default: true }
					});

					var node_13 = $.sibling(node_12, 2);

					ToggleOption(node_13, {
						value: 'parent',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_10 = $.text('Parent');

							$.append($$anchor, text_10);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_14 = $.child(div_2);

	RangeField(node_14, {
		label: 'Padding Outer',
		get value() {
			return config().paddingOuter;
		},

		set value($$value) {
			config(config().paddingOuter = $$value, true);
		}
	});

	var node_15 = $.sibling(node_14, 2);

	RangeField(node_15, {
		label: 'Padding Inner',
		get value() {
			return config().paddingInner;
		},

		set value($$value) {
			config(config().paddingInner = $$value, true);
		}
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_16 = $.child(div_3);

	RangeField(node_16, {
		label: 'Padding Top',
		get value() {
			return config().paddingTop;
		},

		set value($$value) {
			config(config().paddingTop = $$value, true);
		}
	});

	var node_17 = $.sibling(node_16, 2);

	RangeField(node_17, {
		label: 'Padding Bottom',
		get value() {
			return config().paddingBottom;
		},

		set value($$value) {
			config(config().paddingBottom = $$value, true);
		}
	});

	var node_18 = $.sibling(node_17, 2);

	RangeField(node_18, {
		label: 'Padding Left',
		get value() {
			return config().paddingLeft;
		},

		set value($$value) {
			config(config().paddingLeft = $$value, true);
		}
	});

	var node_19 = $.sibling(node_18, 2);

	RangeField(node_19, {
		label: 'Padding Right',
		get value() {
			return config().paddingRight;
		},

		set value($$value) {
			config(config().paddingRight = $$value, true);
		}
	});

	$.reset(div_3);

	var node_20 = $.sibling(div_3, 2);

	{
		var consequent = ($$anchor) => {
			var div_4 = root_3();
			var node_21 = $.child(div_4);

			Field(node_21, {
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
								return config().isFiltered;
							},

							set checked($$value) {
								config(config().isFiltered = $$value, true);
							}
						});
					}
				}
			});

			$.reset(div_4);
			$.append($$anchor, div_4);
		};

		$.if(node_20, ($$render) => {
			if (config().isFiltered !== undefined) $$render(consequent);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}