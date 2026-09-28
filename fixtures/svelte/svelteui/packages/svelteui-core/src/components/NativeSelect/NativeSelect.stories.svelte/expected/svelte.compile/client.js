import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { NativeSelect } from './index';

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function NativeSelect_stories($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Meta(node, {
		title: 'Components/NativeSelect',
		get component() {
			return NativeSelect;
		}
	});

	var node_1 = $.sibling(node, 2);

	Template(node_1, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);

				NativeSelect($$anchor, $.spread_props(
					{
						data: ['Svelte', 'React', 'Vue', 'Angular', 'Solid'],
						placeholder: 'Pick one',
						label: 'Select your favorite framework/library',
						description: 'This is anonymous'
					},
					() => $.get(args)
				));
			}
		}
	});

	var node_2 = $.sibling(node_1, 2);

	Story(node_2, { name: 'NativeSelect', id: 'nativeSelectStory' });

	var node_3 = $.sibling(node_2, 2);

	Story(node_3, {
		name: 'NativeSelect with error',
		id: 'nativeSelectErrorStory',
		args: { error: 'Pick at least one item' }
	});

	var node_4 = $.sibling(node_3, 2);

	Story(node_4, {
		name: 'NativeSelect with array of objects',
		id: 'nativeSelectObjectsStory',
		args: {
			data: [
				{ value: 'svelte', label: 'Svelte' },
				{ value: 'react', label: 'React' },
				{ value: 'vue', label: 'Vue' },
				{ value: 'angular', label: 'Angular' },
				{ value: 'solid', label: 'Solid' }
			],
			placeholder: 'Pick one',
			label: 'Select your favorite framework/library',
			description: 'This is anonymous'
		}
	});

	var node_5 = $.sibling(node_4, 2);

	Story(node_5, {
		name: 'NativeSelect with custom right section',
		id: 'nativeSelectRightSectionStory',
		children: ($$anchor, $$slotProps) => {
			NativeSelect($$anchor, {
				data: ['Svelte', 'React', 'Vue', 'Angular', 'Solid'],
				placeholder: 'Pick one',
				label: 'Select your favorite framework/library',
				description: 'This is anonymous',
				$$slots: {
					rightSection: ($$anchor, $$slotProps) => {
						var text = $.text('+');

						$.append($$anchor, text);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}