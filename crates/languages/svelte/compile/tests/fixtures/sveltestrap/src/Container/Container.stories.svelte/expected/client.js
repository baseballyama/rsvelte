import 'svelte/internal/disclose-version';
import Container from './Container.svelte';
import * as $ from 'svelte/internal/client';
import { Story, Template } from '@storybook/addon-svelte-csf';

export const meta = {
	title: 'Stories/Container',
	component: Container,
	parameters: { controls: { exclude: /^(default)$/g } },
	argTypes: {
		class: { className: 'string', table: { disable: true } },
		sm: { control: 'boolean' },
		md: { control: 'boolean' },
		lg: { control: 'boolean' },
		xl: { control: 'boolean' },
		xxl: { control: 'boolean' },
		fluid: { control: 'boolean' },
		'default ': {
			description: 'This is the default content slot.',
			table: {
				category: 'slots',
				type: { summary: 'any' },
				defaultValue: { summary: 'empty' }
			}
		}
	},
	args: {
		sm: true,
		md: true,
		lg: true,
		xl: true,
		xxl: true,
		fluid: true
	}
};

var root = $.from_html(`<h3 class="container">fluid</h3>`);
var root_1 = $.from_html(`<h3 class="container">sm</h3>`);
var root_2 = $.from_html(`<h3 class="container">md</h3>`);
var root_3 = $.from_html(`<h3 class="container">lg</h3>`);
var root_4 = $.from_html(`<h3 class="container">xl</h3>`);
var root_5 = $.from_html(`<h3 class="container">xxl</h3>`);
var root_6 = $.from_html(`<div class="grid-example"><div class="container-wrapper"><!> <div class="contained"><!> <!> <!> <!> <!></div></div></div>`);
var root_7 = $.from_html(`<!> <!>`, 1);

export default function Container_stories($$anchor) {
	var fragment = root_7();
	var node = $.first_child(fragment);

	Template(node, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);

				Container($$anchor, $.spread_props(() => $.get(args), {
					children: ($$anchor, $$slotProps) => {
						var h3 = root();

						$.append($$anchor, h3);
					},
					$$slots: { default: true }
				}));
			}
		}
	});

	var node_1 = $.sibling(node, 2);

	Story(node_1, {
		name: 'Basic',
		children: ($$anchor, $$slotProps) => {
			var div = root_6();
			var div_1 = $.child(div);
			var node_2 = $.child(div_1);

			Container(node_2, {
				fluid: true,
				children: ($$anchor, $$slotProps) => {
					var h3_1 = root();

					$.append($$anchor, h3_1);
				},
				$$slots: { default: true }
			});

			var div_2 = $.sibling(node_2, 2);
			var node_3 = $.child(div_2);

			Container(node_3, {
				sm: true,
				children: ($$anchor, $$slotProps) => {
					var h3_2 = root_1();

					$.append($$anchor, h3_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			Container(node_4, {
				md: true,
				children: ($$anchor, $$slotProps) => {
					var h3_3 = root_2();

					$.append($$anchor, h3_3);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			Container(node_5, {
				lg: true,
				children: ($$anchor, $$slotProps) => {
					var h3_4 = root_3();

					$.append($$anchor, h3_4);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_5, 2);

			Container(node_6, {
				xl: true,
				children: ($$anchor, $$slotProps) => {
					var h3_5 = root_4();

					$.append($$anchor, h3_5);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_6, 2);

			Container(node_7, {
				xxl: true,
				children: ($$anchor, $$slotProps) => {
					var h3_6 = root_5();

					$.append($$anchor, h3_6);
				},
				$$slots: { default: true }
			});

			$.reset(div_2);
			$.reset(div_1);
			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}