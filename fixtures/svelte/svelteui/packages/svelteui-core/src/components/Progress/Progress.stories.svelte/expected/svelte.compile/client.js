import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { Progress } from './index';

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Progress_stories($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Meta(node, {
		title: 'Components/Progress',
		get component() {
			return Progress;
		}
	});

	var node_1 = $.sibling(node, 2);

	Template(node_1, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);

				Progress($$anchor, $.spread_props(() => $.get(args)));
			}
		}
	});

	var node_2 = $.sibling(node_1, 2);

	Story(node_2, { name: 'Menu', id: 'progressStory', args: { value: 40 } });

	var node_3 = $.sibling(node_2, 2);

	Story(node_3, {
		name: 'With label',
		id: 'progressLabelStory',
		args: { size: 'xl', value: 25, label: '25%' }
	});

	var node_4 = $.sibling(node_3, 2);

	Story(node_4, {
		name: 'Sections',
		id: 'progressSectionsStory',
		children: ($$anchor, $$slotProps) => {
			Progress($$anchor, {
				size: 'xl',
				sections: [
					{ value: 40, color: 'cyan' },
					{ value: 20, color: 'blue' },
					{ value: 15, color: 'indigo' }
				]
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}