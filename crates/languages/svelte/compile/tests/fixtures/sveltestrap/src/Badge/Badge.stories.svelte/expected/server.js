import * as $ from 'svelte/internal/server';
import { Story, Template } from '@storybook/addon-svelte-csf';
import { Button } from '@sveltestrap/sveltestrap';
import Badge from './Badge.svelte';

export const meta = {
	title: 'Stories/Badges',
	component: Badge,
	parameters: { controls: { exclude: /^(default)$/g } },
	argTypes: {
		ariaLabel: { control: '' },
		border: {
			control: { type: 'select' },
			options: [
				'',
				'border',
				'border-top',
				'border-end',
				'border-bottom',
				'border-start'
			]
		},
		class: { control: false, table: { disable: true } },
		content: { control: '' },
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
		href: { control: '' },
		indicator: { control: 'boolean' },
		pill: { control: 'boolean' },
		positioned: { control: 'boolean' },
		placement: { control: '' },
		shadow: {
			control: { type: 'select' },
			options: ['', 'shadow-none', 'shadow-sm', 'shadow', 'shadow-lg']
		},
		theme: {
			control: { type: 'select' },
			options: ['dark', 'light', 'auto'],
			description: 'The theme style to apply.',
			table: {
				type: { summary: 'string' },
				defaultValue: { summary: 'auto' }
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
		ariaLabel: '',
		border: false,
		class: '',
		content: '',
		color: 'primary',
		href: '',
		indicator: false,
		pill: false,
		placement: 'top-0 start-100',
		positioned: false,
		shadow: false,
		theme: null
	}
};

export default function Badge_stories($$renderer) {
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

	const basicSource = `
   <Badge color="primary">Badge</Badge>
  `;

	Template($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				Badge($$renderer, $.spread_props([args]));
			}
		}
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Basic',
		args: { color: 'primary', content: 'Badge' },
		source: basicSource
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Colors',
		children: ($$renderer) => {
			$$renderer.push(`<div class="horizontal"><!--[-->`);

			const each_array = $.ensure_array_like(colors);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let color = each_array[$$index];

				Badge($$renderer, {
					color,
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(color)}`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]--></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Buttons',
		children: ($$renderer) => {
			$$renderer.push(`<div class="horizontal">`);

			Button($$renderer, {
				color: 'primary',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Notifications `);

					Badge($$renderer, {
						color: 'dark',
						children: ($$renderer) => {
							$$renderer.push(`<!---->4`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				color: 'primary',
				outline: true,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Notifications `);

					Badge($$renderer, {
						color: 'primary',
						children: ($$renderer) => {
							$$renderer.push(`<!---->7`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Positioned',
		children: ($$renderer) => {
			$$renderer.push(`<div class="mb-3">`);

			Button($$renderer, {
				color: 'primary',
				class: 'position-relative',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Inbox `);

					Badge($$renderer, {
						color: 'danger',
						pill: true,
						positioned: true,
						ariaLabel: 'Unread messages',
						children: ($$renderer) => {
							$$renderer.push(`<!---->100+`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div>`);

			Button($$renderer, {
				color: 'primary',
				class: 'position-relative',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Profile `);

					Badge($$renderer, {
						color: 'danger',
						pill: true,
						indicator: true,
						border: true,
						positioned: true,
						ariaLabel: 'New alerts'
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Pills',
		children: ($$renderer) => {
			$$renderer.push(`<div class="horizontal"><!--[-->`);

			const each_array_1 = $.ensure_array_like(colors);

			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let color = each_array_1[$$index_1];

				Badge($$renderer, {
					pill: true,
					color,
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(color)}`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]--></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Links',
		children: ($$renderer) => {
			Badge($$renderer, {
				href: 'https://svelte.dev',
				color: 'primary',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Link Badge`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Headings',
		children: ($$renderer) => {
			$$renderer.push(`<div class="headings-example"><h1>Example heading `);

			Badge($$renderer, {
				color: 'secondary',
				children: ($$renderer) => {
					$$renderer.push(`<!---->New`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></h1> <h2>Example heading `);

			Badge($$renderer, {
				color: 'secondary',
				children: ($$renderer) => {
					$$renderer.push(`<!---->New`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></h2> <h3>Example heading `);

			Badge($$renderer, {
				color: 'secondary',
				children: ($$renderer) => {
					$$renderer.push(`<!---->New`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></h3> <h4>Example heading `);

			Badge($$renderer, {
				color: 'secondary',
				children: ($$renderer) => {
					$$renderer.push(`<!---->New`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></h4> <h5>Example heading `);

			Badge($$renderer, {
				color: 'secondary',
				children: ($$renderer) => {
					$$renderer.push(`<!---->New`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></h5> <h6>Example heading `);

			Badge($$renderer, {
				color: 'secondary',
				children: ($$renderer) => {
					$$renderer.push(`<!---->New`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></h6></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}