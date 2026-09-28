import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { Alert } from './index';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Alert_stories($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Meta(node, {
		title: 'Components/Alert',
		get component() {
			return Alert;
		}
	});

	var node_1 = $.sibling(node, 2);

	Template(node_1, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);

				Alert($$anchor, $.spread_props(() => $.get(args), {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('This is an alert!');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				}));
			}
		}
	});

	var node_2 = $.sibling(node_1, 2);

	Story(node_2, { name: 'Alert', id: 'alertStory' });
	$.append($$anchor, fragment);
}