import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { useSvelteUITheme } from '$lib/styles';
import { Checkbox } from './index';

var root = $.from_html(`<div style="display: flex; gap: 10px;"></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Checkbox_stories($$anchor, $$props) {
	$.push($$props, true);

	const theme = useSvelteUITheme();
	const colors = Object.keys(theme.colorNames);
	var fragment = root_1();
	var node = $.first_child(fragment);

	Meta(node, {
		title: 'Components/Checkbox',
		get component() {
			return Checkbox;
		}
	});

	var node_1 = $.sibling(node, 2);

	Template(node_1, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);

				Checkbox($$anchor, $.spread_props(() => $.get(args)));
			}
		}
	});

	var node_2 = $.sibling(node_1, 2);

	Story(node_2, { name: 'Checkbox', id: 'checkboxStory' });

	var node_3 = $.sibling(node_2, 2);

	Story(node_3, {
		name: 'Colors',
		id: 'checkboxColorsStory',
		children: ($$anchor, $$slotProps) => {
			var div = root();

			$.each(div, 21, () => colors, $.index, ($$anchor, color) => {
				Checkbox($$anchor, {
					get color() {
						return $.get(color);
					}
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Story(node_4, {
		name: 'Disabled',
		id: 'checkboxDisabledStory',
		args: { disabled: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}