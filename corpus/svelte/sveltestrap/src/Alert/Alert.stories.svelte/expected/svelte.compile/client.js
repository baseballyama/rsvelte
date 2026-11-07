import 'svelte/internal/disclose-version';
import Alert from './Alert.svelte';
import * as $ from 'svelte/internal/client';
import { Story, Template } from '@storybook/addon-svelte-csf';
import { Button } from '@sveltestrap/sveltestrap';

export const meta = {
	title: 'Stories/Alert',
	component: Alert,
	parameters: { controls: { exclude: /^(default)$/g } },
	argTypes: {
		class: { control: false, table: { disable: true } },
		content: { control: '' },
		closeClassName: { control: false, table: { disable: true } },
		closeAriaLabel: { control: false, table: { disable: true } },
		color: {
			control: { type: 'select' },
			options: [
				'primary',
				'secondary',
				'success',
				'danger',
				'warning',
				'info',
				'light',
				'dark'
			]
		},
		dismissible: { control: 'boolean' },
		fade: { control: 'boolean' },
		heading: { control: '' },
		isOpen: { control: 'boolean' },
		theme: {
			control: { type: 'select' },
			options: ['dark', 'light', 'auto'],
			description: 'The theme style to apply.',
			table: {
				type: { summary: 'string' },
				defaultValue: { summary: 'auto' }
			}
		},
		toggle: { control: false, table: { disable: true } },
		transition: { control: false, table: { disable: true } },
		'heading ': {
			description: 'This is the slot to use for custom headings.',
			table: {
				category: 'slots',
				type: { summary: 'any' },
				defaultValue: { summary: 'empty' }
			}
		},
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
		class: '',
		content: undefined,
		color: 'success',
		closeClassName: '',
		closeAriaLabel: 'Close',
		dismissible: false,
		fade: true,
		heading: '',
		isOpen: true,
		theme: null
	}
};

var root = $.from_html(`<h4 class="alert-heading text-capitalize">Heading</h4> This is the contents of a&nbsp;<b><u> </u></b> alert message.&nbsp; <a href="#todo" class="alert-link">Also, links are colored to match the assigned alert color!</a>`, 1);
var root_1 = $.from_html(`I can be controlled via <code>isOpen</code> and <code>toggle</code>.`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<h4 class="alert-heading">Dark Theme</h4> I am a&nbsp;<code>dark</code> themed primary alert!`, 1);
var root_4 = $.from_html(`I am a&nbsp;<code>light</code> themed primary alert!`, 1);
var root_5 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Alert_stories($$anchor, $$props) {
	const colors = [
		'primary',
		'secondary',
		'success',
		'danger',
		'warning',
		'info',
		'light',
		'dark'
	];

	let isOpen = true;
	let toggle = () => isOpen = !isOpen;
	var fragment = root_5();
	var node = $.first_child(fragment);

	Template(node, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);

				Alert($$anchor, $.spread_props(() => $.get(args), {
					$$events: {
						click: function ($$arg) {
							$.bubble_event.call(this, $$props, $$arg);
						}
					}
				}));
			}
		}
	});

	var node_1 = $.sibling(node, 2);

	Story(node_1, {
		name: 'Basic',
		args: { content: "Hello, I'm a warning message.", color: 'warning' }
	});

	var node_2 = $.sibling(node_1, 2);

	Story(node_2, {
		name: 'Colors',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = $.comment();
			var node_3 = $.first_child(fragment_2);

			$.each(node_3, 17, () => colors, $.index, ($$anchor, color) => {
				Alert($$anchor, {
					get color() {
						return $.get(color);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_4 = root();
						var b = $.sibling($.first_child(fragment_4), 2);
						var u = $.child(b);
						var text = $.only_child(u, true);

						$.reset(b);
						$.next(2);
						$.template_effect(() => $.set_text(text, $.get(color)));
						$.append($$anchor, fragment_4);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_2, 2);

	Story(node_4, {
		name: 'Fade',
		children: ($$anchor, $$slotProps) => {
			Alert($$anchor, {
				color: 'primary',
				get isOpen() {
					return isOpen;
				},
				toggle: () => isOpen = false,
				fade: false,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('I am a primary alert and I can be dismissed without animating!');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Story(node_5, {
		name: 'Header',
		children: ($$anchor, $$slotProps) => {
			Alert($$anchor, {
				color: 'primary',
				heading: 'Hey here\'s header text',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Lorem ipsum lorem dolor sit amet.');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	Story(node_6, {
		name: 'Dismissible',
		children: ($$anchor, $$slotProps) => {
			Alert($$anchor, {
				color: 'info',
				dismissible: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('I am an alert and I can be dismissed!');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	Story(node_7, {
		name: 'Controlled',
		children: ($$anchor, $$slotProps) => {
			var fragment_8 = root_2();
			var node_8 = $.first_child(fragment_8);

			Alert(node_8, {
				color: 'primary',
				get isOpen() {
					return isOpen;
				},
				toggle: () => isOpen = false,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_9 = root_1();

					$.next(4);
					$.append($$anchor, fragment_9);
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_8, 2);

			Button(node_9, {
				color: 'danger',
				$$events: { click: toggle },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('You can toggle me here.');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_8);
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_7, 2);

	Story(node_10, {
		name: 'Theming',
		children: ($$anchor, $$slotProps) => {
			var fragment_10 = root_2();
			var node_11 = $.first_child(fragment_10);

			Alert(node_11, {
				theme: 'dark',
				color: 'primary',
				isOpen: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_11 = root_3();

					$.next(3);
					$.append($$anchor, fragment_11);
				},
				$$slots: { default: true }
			});

			var node_12 = $.sibling(node_11, 2);

			Alert(node_12, {
				theme: 'light',
				heading: 'Light Theme',
				color: 'primary',
				isOpen: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_12 = root_4();

					$.next(2);
					$.append($$anchor, fragment_12);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_10);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}