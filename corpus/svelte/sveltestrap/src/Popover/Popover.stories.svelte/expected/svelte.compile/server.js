import * as $ from 'svelte/internal/server';
import { Story } from '@storybook/addon-svelte-csf';
import { Button } from '@sveltestrap/sveltestrap';
import Popover from './Popover.svelte';

export const meta = {
	title: 'Stories/Popovers',
	component: Popover,
	parameters: { controls: { exclude: /^(default)$/g } },
	argTypes: {
		animation: { control: 'boolean' },
		content: { control: '' },
		class: { control: false, table: { disable: true } },
		container: { control: false, table: { disable: true } },
		dismissible: { control: 'boolean' },
		hideOnOutsideClick: { control: 'boolean' },
		isOpen: { control: 'boolean' },
		placement: {
			control: { type: 'select' },
			options: ['top', 'left', 'right', 'bottom', 'auto']
		},
		target: { control: false, table: { disable: true } },
		theme: {
			control: { type: 'select' },
			options: ['dark', 'light', 'auto'],
			description: 'The theme style to apply.',
			table: {
				type: { summary: 'string' },
				defaultValue: { summary: 'auto' }
			}
		},
		title: { control: '' },
		trigger: {
			control: { type: 'select' },
			options: ['click', 'hover', 'focus']
		},
		'title ': {
			description: 'This slot is used for provided a custom title.',
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
		animation: true,
		content: '',
		container: undefined,
		dismissible: false,
		hideOnOutsideClick: false,
		isOpen: false,
		placement: 'top',
		theme: null,
		title: 'Popover',
		trigger: 'click'
	}
};

export default function Popover_stories($$renderer) {
	const placements = ['top', 'right', 'left', 'bottom', 'auto'];
	const colors = ['primary', 'success', 'danger', 'warning'];

	const basicSource = `<Button color="primary" id="btn-top-basic">Show on top</Button>

<Popover
  target="btn-top-basic"
  placement="top"
  title="Popover Top">
  This Popover will be shown above the trigger element.
</Popover>`;

	Story($$renderer, {
		name: 'Basic',
		source: basicSource,
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				Button($$renderer, {
					color: 'primary',
					id: 'btn-top-basic',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Show on ${$.escape(args.placement)}`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <!---->`);

				{
					Popover($$renderer, $.spread_props([
						args,
						{
							target: 'btn-top-basic',
							style: args.theme === 'dark' ? 'color: #fff;' : '',
							children: ($$renderer) => {
								$$renderer.push(`<!---->This Popover is using <b>${$.escape(args.placement)}</b> placement.`);
							},
							$$slots: { default: true }
						}
					]));
				}

				$$renderer.push(`<!---->`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Placement',
		children: ($$renderer) => {
			$$renderer.push(`<div class="horizontal"><!--[-->`);

			const each_array = $.ensure_array_like(placements);

			for (let index = 0, $$length = each_array.length; index < $$length; index++) {
				let placement = each_array[index];

				Button($$renderer, {
					color: colors[index],
					id: `btn-${$.stringify(placement)}`,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Show on ${$.escape(placement)}`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Popover($$renderer, {
					target: `btn-${$.stringify(placement)}`,
					placement,
					title: `Popover ${$.stringify(placement)}`,
					children: ($$renderer) => {
						$$renderer.push(`<!---->This Popover placement is <b>${$.escape(placement)}</b>.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			}

			$$renderer.push(`<!--]--></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Triggers',
		children: ($$renderer) => {
			$$renderer.push(`<div class="horizontal"><div>`);

			Button($$renderer, {
				color: 'primary',
				id: 'btn-trigger-click',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Click me`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Popover($$renderer, {
				trigger: 'click',
				placement: 'top',
				target: 'btn-trigger-click',
				title: 'Popover on click',
				children: ($$renderer) => {
					$$renderer.push(`<!---->This Popover is shown when clicking on the trigger element.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div>`);

			Button($$renderer, {
				color: 'warning',
				id: 'btn-trigger-hover',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Hover me`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Popover($$renderer, {
				trigger: 'hover',
				placement: 'right',
				target: 'btn-trigger-hover',
				title: 'Popover with hover',
				children: ($$renderer) => {
					$$renderer.push(`<!---->This Popover is shown while hovering over the trigger element.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div>`);

			Button($$renderer, {
				color: 'danger',
				id: 'btn-trigger-focus',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Focus me`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Popover($$renderer, {
				trigger: 'focus',
				placement: 'bottom',
				target: 'btn-trigger-focus',
				title: 'Popover with focus',
				children: ($$renderer) => {
					$$renderer.push(`<!---->This Popover is shown while focusing on the trigger element.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Dismissible',
		children: ($$renderer) => {
			Button($$renderer, {
				color: 'primary',
				id: 'btn-dismissible',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Click me`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Popover($$renderer, {
				placement: 'right',
				target: 'btn-dismissible',
				dismissible: true,
				children: ($$renderer) => {
					$$renderer.push(`<!---->This Popover is dismissesed when any click occurs.`);
				},

				$$slots: {
					default: true,
					title: ($$renderer) => {
						$$renderer.push(`<div slot="title"><i>Hello</i> <b>World!</b></div>`);
					}
				}
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'OutsideClick',
		children: ($$renderer) => {
			Button($$renderer, {
				color: 'primary',
				id: 'btn-outside-click',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Click me`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Popover($$renderer, {
				placement: 'right',
				target: 'btn-outside-click',
				hideOnOutsideClick: true,
				children: ($$renderer) => {
					$$renderer.push(`<!---->You can click inside this Popover and it will not dismiss. Dismissal will only occur if the click is outside of the popover.`);
				},

				$$slots: {
					default: true,
					title: ($$renderer) => {
						$$renderer.push(`<div slot="title"><i>Hello</i> <b>World!</b></div>`);
					}
				}
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Theming',
		children: ($$renderer) => {
			$$renderer.push(`<div class="horizontal gap-lg">`);

			Button($$renderer, {
				color: 'dark',
				id: 'btn-dark-theme',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Show dark theme`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				color: 'light',
				id: 'btn-light-theme',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Show light theme`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			Popover($$renderer, {
				theme: 'light',
				placement: 'right',
				target: 'btn-light-theme',
				hideOnOutsideClick: true,
				children: ($$renderer) => {
					$$renderer.push(`<!---->You can click inside this Popover and it will not dismiss. Dismissal will only occur if the click is outside of the popover.`);
				},

				$$slots: {
					default: true,
					title: ($$renderer) => {
						$$renderer.push(`<div slot="title"><i>Hello</i> <b>World!</b></div>`);
					}
				}
			});

			$$renderer.push(`<!----> `);

			Popover($$renderer, {
				theme: 'dark',
				placement: 'right',
				target: 'btn-dark-theme',
				hideOnOutsideClick: true,
				children: ($$renderer) => {
					$$renderer.push(`<!---->You can click inside this Popover and it will not dismiss. Dismissal will only occur if the click is outside of the popover.`);
				},

				$$slots: {
					default: true,
					title: ($$renderer) => {
						$$renderer.push(`<div slot="title" style="color: #fff;"><i>Hello</i> <b>World!</b></div>`);
					}
				}
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}