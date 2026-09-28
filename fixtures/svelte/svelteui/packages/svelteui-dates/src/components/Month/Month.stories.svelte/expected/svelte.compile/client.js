import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { Month } from './index';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Month_stories($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var node = $.first_child(fragment);

	Meta(node, {
		title: 'Dates/Month',
		get component() {
			return Month;
		}
	});

	var node_1 = $.sibling(node, 2);

	Template(node_1, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);

				Month($$anchor, $.spread_props(() => $.get(args), { month: new Date() }));
			}
		}
	});

	var node_2 = $.sibling(node_1, 2);

	Story(node_2, { name: 'Month', id: 'monthStory' });
	$.append($$anchor, fragment);
	$.pop();
}