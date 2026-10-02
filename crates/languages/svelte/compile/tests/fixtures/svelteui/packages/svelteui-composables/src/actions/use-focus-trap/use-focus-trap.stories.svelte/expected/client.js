import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { Button, Text, Title, NativeSelect, TextInput } from '@svelteuidev/core';
import { focustrap } from './use-focus-trap';

var root = $.from_html(`<!> <div><!> <!> <!> <!> <!></div>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Use_focus_trap_stories($$anchor) {
	let active = false;
	var fragment = root_1();
	var node = $.first_child(fragment);

	Meta(node, { title: 'Composables/use-focus-trap' });

	var node_1 = $.sibling(node, 2);

	Template(node_1, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);
				var fragment_1 = root();
				var node_2 = $.first_child(fragment_1);

				Button(node_2, {
					$$events: { click: () => active = !active },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text();

						$.template_effect(() => $.set_text(text, active ? 'Deactivate Focus Trap' : 'Activate Focus Trap'));
						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				var div = $.sibling(node_2, 2);
				var node_3 = $.child(div);

				Title(node_3, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Form');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				var node_4 = $.sibling(node_3, 2);

				Text(node_4, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('Please fill out this form');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});

				var node_5 = $.sibling(node_4, 2);

				TextInput(node_5, { placeholder: 'Your name', label: 'Full name' });

				var node_6 = $.sibling(node_5, 2);

				NativeSelect(node_6, {
					data: ['Svelte', 'React', 'Vue', 'Angular', 'Solid'],
					placeholder: 'Pick one',
					label: 'Select your favorite framework/library',
					description: 'This is anonymous'
				});

				var node_7 = $.sibling(node_6, 2);

				Button(node_7, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text('Submit');

						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});

				$.reset(div);
				$.action(div, ($$node, $$action_arg) => focustrap?.($$node, $$action_arg), () => active);
				$.append($$anchor, fragment_1);
			}
		}
	});

	var node_8 = $.sibling(node_1, 2);

	Story(node_8, { name: 'use-focus-trap', id: 'useFocusTrapStory' });
	$.append($$anchor, fragment);
}