import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { ChipGroup } from '../index';

var root = $.from_html(`<!> <p>Variable bound to value: <code> </code></p>`, 1);
var root_1 = $.from_html(`<p> </p> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function ChipGroup_stories($$anchor) {
	const spacings = ['xs', 'sm', 'md', 'lg', 'xl'];
	const directions = ['column', 'row'];
	let bindValue;
	var fragment = root_2();
	var node = $.first_child(fragment);

	Meta(node, {
		title: 'Components/Chip/ChipGroup',
		get component() {
			return ChipGroup;
		}
	});

	var node_1 = $.sibling(node, 2);

	Template(node_1, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);

				ChipGroup($$anchor, $.spread_props(() => $.get(args)));
			}
		}
	});

	var node_2 = $.sibling(node_1, 2);

	Story(node_2, {
		name: 'ChipGroup',
		args: {
			items: [
				{ label: 'Chip', value: 'chip' },
				{ label: 'Dip', value: 'dip' }
			]
		},
		id: 'chipGroupStory'
	});

	var node_3 = $.sibling(node_2, 2);

	Story(node_3, {
		name: 'Allow multiple',
		id: 'chipGroupMultipleStory',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root();
			var node_4 = $.first_child(fragment_2);

			ChipGroup(node_4, {
				multiple: true,
				items: [
					{ label: 'One', value: 'one' },
					{ label: 'Two', value: 'two' },
					{ label: 'Three', value: 'three' }
				],

				get value() {
					return bindValue;
				},

				set value($$value) {
					bindValue = $$value;
				}
			});

			var p = $.sibling(node_4, 2);
			var code = $.sibling($.child(p));
			var text = $.only_child(code, true);

			$.reset(p);
			$.template_effect(($0) => $.set_text(text, $0), [() => JSON.stringify(bindValue)]);
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_3, 2);

	Story(node_5, {
		name: 'Bind value',
		id: 'chipGroupBindStory',
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root();
			var node_6 = $.first_child(fragment_3);

			ChipGroup(node_6, {
				items: [
					{ label: 'One', value: 'one' },
					{ label: 'Two', value: 'two' },
					{ label: 'Three', value: 'three' }
				],

				get value() {
					return bindValue;
				},

				set value($$value) {
					bindValue = $$value;
				}
			});

			var p_1 = $.sibling(node_6, 2);
			var code_1 = $.sibling($.child(p_1));
			var text_1 = $.only_child(code_1, true);

			$.reset(p_1);
			$.template_effect(($0) => $.set_text(text_1, $0), [() => JSON.stringify(bindValue)]);
			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_5, 2);

	Story(node_7, {
		name: 'Spacing',
		id: 'chipGroupSpacingStory',
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = $.comment();
			var node_8 = $.first_child(fragment_4);

			$.each(node_8, 17, () => spacings, $.index, ($$anchor, spacing) => {
				var fragment_5 = root_1();
				var p_2 = $.first_child(fragment_5);
				var text_2 = $.only_child(p_2);
				var node_9 = $.sibling(p_2, 2);

				ChipGroup(node_9, {
					get spacing() {
						return $.get(spacing);
					},

					items: [
						{ label: 'One', value: 'one' },
						{ label: 'Two', value: 'two' },
						{ label: 'Three', value: 'three' }
					],

					get value() {
						return bindValue;
					},

					set value($$value) {
						bindValue = $$value;
					}
				});

				$.template_effect(() => $.set_text(text_2, `Spacing: ${$.get(spacing) ?? ''}`));
				$.append($$anchor, fragment_5);
			});

			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_7, 2);

	Story(node_10, {
		name: 'Directions',
		id: 'chipGroupDirectionsStory',
		children: ($$anchor, $$slotProps) => {
			var fragment_6 = $.comment();
			var node_11 = $.first_child(fragment_6);

			$.each(node_11, 17, () => directions, $.index, ($$anchor, direction) => {
				var fragment_7 = root_1();
				var p_3 = $.first_child(fragment_7);
				var text_3 = $.only_child(p_3);
				var node_12 = $.sibling(p_3, 2);

				ChipGroup(node_12, {
					get direction() {
						return $.get(direction);
					},

					items: [
						{ label: 'One', value: 'one' },
						{ label: 'Two', value: 'two' },
						{ label: 'Three', value: 'three' }
					],

					get value() {
						return bindValue;
					},

					set value($$value) {
						bindValue = $$value;
					}
				});

				$.template_effect(() => $.set_text(text_3, `Direction: ${$.get(direction) ?? ''}`));
				$.append($$anchor, fragment_7);
			});

			$.append($$anchor, fragment_6);
		},
		$$slots: { default: true }
	});

	var node_13 = $.sibling(node_10, 2);

	Story(node_13, {
		name: 'Input label',
		id: 'chipGroupLabelStory',
		children: ($$anchor, $$slotProps) => {
			ChipGroup($$anchor, {
				multiple: true,
				label: 'Pick as many as you like',
				items: [
					{ label: 'One', value: 'one' },
					{ label: 'Two', value: 'two' },
					{ label: 'Three', value: 'three' }
				],

				get value() {
					return bindValue;
				},

				set value($$value) {
					bindValue = $$value;
				}
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}