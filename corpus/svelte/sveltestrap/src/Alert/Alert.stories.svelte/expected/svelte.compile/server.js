import * as $ from 'svelte/internal/server';
import { Story, Template } from '@storybook/addon-svelte-csf';
import { Button } from '@sveltestrap/sveltestrap';
import Alert from './Alert.svelte';

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

export default function Alert_stories($$renderer) {
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

	Template($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				Alert($$renderer, $.spread_props([args]));
			}
		}
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Basic',
		args: { content: "Hello, I'm a warning message.", color: 'warning' }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Colors',
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(colors);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let color = each_array[$$index];

				Alert($$renderer, {
					color,
					children: ($$renderer) => {
						$$renderer.push(`<h4 class="alert-heading text-capitalize">Heading</h4> This is the contents of a <b><u>${$.escape(color)}</u></b> alert message.  <a href="#todo" class="alert-link">Also, links are colored to match the assigned alert color!</a>`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Fade',
		children: ($$renderer) => {
			Alert($$renderer, {
				color: 'primary',
				isOpen,
				toggle: () => isOpen = false,
				fade: false,
				children: ($$renderer) => {
					$$renderer.push(`<!---->I am a primary alert and I can be dismissed without animating!`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Header',
		children: ($$renderer) => {
			Alert($$renderer, {
				color: 'primary',
				heading: 'Hey here\'s header text',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Lorem ipsum lorem dolor sit amet.`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Dismissible',
		children: ($$renderer) => {
			Alert($$renderer, {
				color: 'info',
				dismissible: true,
				children: ($$renderer) => {
					$$renderer.push(`<!---->I am an alert and I can be dismissed!`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Controlled',
		children: ($$renderer) => {
			Alert($$renderer, {
				color: 'primary',
				isOpen,
				toggle: () => isOpen = false,
				children: ($$renderer) => {
					$$renderer.push(`<!---->I can be controlled via <code>isOpen</code> and <code>toggle</code>.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				color: 'danger',
				children: ($$renderer) => {
					$$renderer.push(`<!---->You can toggle me here.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Theming',
		children: ($$renderer) => {
			Alert($$renderer, {
				theme: 'dark',
				color: 'primary',
				isOpen: true,
				children: ($$renderer) => {
					$$renderer.push(`<h4 class="alert-heading">Dark Theme</h4> I am a <code>dark</code> themed primary alert!`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Alert($$renderer, {
				theme: 'light',
				heading: 'Light Theme',
				color: 'primary',
				isOpen: true,
				children: ($$renderer) => {
					$$renderer.push(`<!---->I am a <code>light</code> themed primary alert!`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}