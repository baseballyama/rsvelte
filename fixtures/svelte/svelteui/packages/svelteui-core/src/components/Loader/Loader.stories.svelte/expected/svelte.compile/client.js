import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
import { Loader } from './index';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Loader_stories($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	Meta(node, {
		title: 'Components/Loader',
		get component() {
			return Loader;
		}
	});

	var node_1 = $.sibling(node, 2);

	Template(node_1, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);

				Loader($$anchor, $.spread_props(() => $.get(args)));
			}
		}
	});

	var node_2 = $.sibling(node_1, 2);

	Story(node_2, { name: 'Default', id: 'loaderStory' });

	var node_3 = $.sibling(node_2, 2);

	Story(node_3, {
		name: 'Variants',
		id: 'loaderVariantsStory',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root();
			var node_4 = $.first_child(fragment_2);

			Loader(node_4, { variant: 'circle' });

			var node_5 = $.sibling(node_4, 2);

			Loader(node_5, { variant: 'dots' });

			var node_6 = $.sibling(node_5, 2);

			Loader(node_6, { variant: 'bars' });
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_3, 2);

	Story(node_7, {
		name: 'Colors',
		id: 'loaderColorsStory',
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_1();
			var node_8 = $.first_child(fragment_3);

			Loader(node_8, { color: 'red' });

			var node_9 = $.sibling(node_8, 2);

			Loader(node_9, { color: 'green' });

			var node_10 = $.sibling(node_9, 2);

			Loader(node_10, { color: 'teal' });

			var node_11 = $.sibling(node_10, 2);

			Loader(node_11, { color: 'gray' });

			var node_12 = $.sibling(node_11, 2);

			Loader(node_12, { color: 'blue' });

			var node_13 = $.sibling(node_12, 2);

			Loader(node_13, { color: 'yellow' });
			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	var node_14 = $.sibling(node_7, 2);

	Story(node_14, {
		name: 'Size',
		id: 'loaderSizeStory',
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root_2();
			var node_15 = $.first_child(fragment_4);

			Loader(node_15, { size: 'xs' });

			var node_16 = $.sibling(node_15, 2);

			Loader(node_16, { size: 'lg' });

			var node_17 = $.sibling(node_16, 2);

			Loader(node_17, { size: 50 });

			var node_18 = $.sibling(node_17, 2);

			Loader(node_18, { size: 200 });
			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}