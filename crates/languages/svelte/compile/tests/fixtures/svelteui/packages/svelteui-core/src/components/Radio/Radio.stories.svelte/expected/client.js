import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
import RadioGroup from './RadioGroup/RadioGroup.svelte';
import { Radio } from './index';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <p>Variable bound to value: <code> </code></p>`, 1);
var root_2 = $.from_html(`<!> <p>Variable bound to group: <code> </code></p>`, 1);
var root_3 = $.from_html(`<p> </p> <!>`, 1);
var root_4 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Radio_stories($$anchor) {
	const binding_group = [];
	const spacings = ['xs', 'sm', 'md', 'lg', 'xl'];
	const directions = ['column', 'row'];
	let bindValue = 'three';
	let bindGroup = 'two';
	var fragment = root_4();
	var node = $.first_child(fragment);

	Meta(node, {
		title: 'Components/Radio',
		get component() {
			return Radio;
		}
	});

	var node_1 = $.sibling(node, 2);

	Template(node_1, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);
				var fragment_1 = root();
				var node_2 = $.first_child(fragment_1);

				Radio(node_2, $.spread_props(() => $.get(args), { checked: true }));

				var node_3 = $.sibling(node_2, 2);

				Radio(node_3, $.spread_props(() => $.get(args)));
				$.append($$anchor, fragment_1);
			}
		}
	});

	var node_4 = $.sibling(node_1, 2);

	Story(node_4, {
		name: 'Default',
		args: { label: 'Default Radio' },
		id: 'radioStory',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root();
			var node_5 = $.first_child(fragment_2);

			Radio(node_5, { checked: true, label: 'Default Radio' });

			var node_6 = $.sibling(node_5, 2);

			Radio(node_6, { label: 'Default Radio' });
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_4, 2);

	Story(node_7, {
		name: 'Label Direction',
		id: 'radioLabelDirectionStory',
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root();
			var node_8 = $.first_child(fragment_3);

			Radio(node_8, {
				labelDirection: 'right',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Right label');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_8, 2);

			Radio(node_9, {
				labelDirection: 'left',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Left label');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_7, 2);

	Story(node_10, {
		name: 'Bind value',
		id: 'radioBindStory',
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root_1();
			var node_11 = $.first_child(fragment_4);

			RadioGroup(node_11, {
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

			var p = $.sibling(node_11, 2);
			var code = $.sibling($.child(p));
			var text_2 = $.only_child(code, true);

			$.reset(p);
			$.template_effect(() => $.set_text(text_2, bindValue));
			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	var node_12 = $.sibling(node_10, 2);

	Story(node_12, {
		name: 'Bind group',
		id: 'radioBindGroupStory',
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = root_2();
			var node_13 = $.first_child(fragment_5);

			RadioGroup(node_13, {
				items: [
					{ label: 'One', value: 'one' },
					{ label: 'Two', value: 'two' },
					{ label: 'Three', value: 'three' }
				],

				get group() {
					return bindGroup;
				},

				set group($$value) {
					bindGroup = $$value;
				}
			});

			var p_1 = $.sibling(node_13, 2);
			var code_1 = $.sibling($.child(p_1));
			var text_3 = $.only_child(code_1, true);

			$.reset(p_1);
			$.template_effect(() => $.set_text(text_3, bindGroup));
			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});

	var node_14 = $.sibling(node_12, 2);

	Story(node_14, {
		name: 'Spacing',
		id: 'radioSpacingStory',
		children: ($$anchor, $$slotProps) => {
			var fragment_6 = $.comment();
			var node_15 = $.first_child(fragment_6);

			$.each(node_15, 17, () => spacings, $.index, ($$anchor, spacing) => {
				var fragment_7 = root_3();
				var p_2 = $.first_child(fragment_7);
				var text_4 = $.only_child(p_2);
				var node_16 = $.sibling(p_2, 2);

				RadioGroup(node_16, {
					get spacing() {
						return $.get(spacing);
					},

					get size() {
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

				$.template_effect(() => $.set_text(text_4, `Spacing: ${$.get(spacing) ?? ''}`));
				$.append($$anchor, fragment_7);
			});

			$.append($$anchor, fragment_6);
		},
		$$slots: { default: true }
	});

	var node_17 = $.sibling(node_14, 2);

	Story(node_17, {
		name: 'Directions',
		id: 'radioDirectionsStory',
		children: ($$anchor, $$slotProps) => {
			var fragment_8 = $.comment();
			var node_18 = $.first_child(fragment_8);

			$.each(node_18, 17, () => directions, $.index, ($$anchor, direction) => {
				var fragment_9 = root_3();
				var p_3 = $.first_child(fragment_9);
				var text_5 = $.only_child(p_3);
				var node_19 = $.sibling(p_3, 2);

				RadioGroup(node_19, {
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

				$.template_effect(() => $.set_text(text_5, `Direction: ${$.get(direction) ?? ''}`));
				$.append($$anchor, fragment_9);
			});

			$.append($$anchor, fragment_8);
		},
		$$slots: { default: true }
	});

	var node_20 = $.sibling(node_17, 2);

	Story(node_20, {
		name: 'Input label',
		id: 'radioLabelStory',
		children: ($$anchor, $$slotProps) => {
			RadioGroup($$anchor, {
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