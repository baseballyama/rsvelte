import * as $ from 'svelte/internal/server';
import { Story, Template } from '@storybook/addon-svelte-csf';
import { Button } from '@sveltestrap/sveltestrap';
import Tooltip from './Tooltip.svelte';

export const meta = {
	title: 'Stories/Tooltip',
	component: Tooltip,
	parameters: { controls: { exclude: /^(default)$/g } },
	argTypes: {
		class: { className: 'string', table: { disable: true } },
		animation: { control: 'boolean' },
		content: { control: 'text' },
		container: { control: 'text', table: { disable: true } },
		delay: { control: 'number' },
		id: { control: 'text', table: { disable: true } },
		isOpen: { control: 'boolean' },
		placement: {
			control: { type: 'select' },
			options: ['top', 'left', 'right', 'bottom']
		},
		target: { control: 'text', table: { disable: true } },
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
		animation: true,
		content: '',
		container: undefined,
		delay: 0,
		id: '',
		isOpen: false,
		placement: 'top',
		target: ''
	}
};

export default function Tooltip_stories($$renderer) {
	const placements = ['top', 'right', 'left', 'bottom'];
	let isOpen = false;
	let myHtmlElementA;
	let myHtmlElementB;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Template($$renderer, {
			children: $.invalid_default_snippet,
			$$slots: {
				default: ($$renderer, { args }) => {
					$$renderer.push(`<!---->`);

					{
						$$renderer.push(`<div class="mt-3">`);

						Button($$renderer, {
							id: `btn-${args.placement}`,
							color: 'primary',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Show ${$.escape(args.placement)}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Tooltip($$renderer, $.spread_props([
							args,
							{
								target: `btn-${args.placement}`,
								'args.placement': true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(args.placement)} tooltip!`);
								},
								$$slots: { default: true }
							}
						]));

						$$renderer.push(`<!----></div>`);
					}

					$$renderer.push(`<!---->`);
				}
			}
		});

		$$renderer.push(`<!----> `);
		Story($$renderer, { name: 'Basic' });
		$$renderer.push(`<!----> `);

		Story($$renderer, {
			name: 'HTML',
			children: ($$renderer) => {
				$$renderer.push(`<div>`);

				Button($$renderer, {
					id: 'btn-right-html',
					color: 'primary',
					children: ($$renderer) => {
						$$renderer.push(`<!---->HTML Tooltips`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Tooltip($$renderer, {
					target: 'btn-right-html',
					placement: 'right',
					children: ($$renderer) => {
						$$renderer.push(`<strong>Hello</strong> <i>World</i>!`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Story($$renderer, {
			name: 'Controlled',
			children: ($$renderer) => {
				$$renderer.push(`<div class="tooltip-example"><div class="text-content"><div class="mt-3">`);

				Button($$renderer, {
					id: 'controlledBtn',
					color: 'primary',
					children: ($$renderer) => {
						$$renderer.push(`<!---->You could hover here`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Tooltip($$renderer, {
					placement: 'right',
					target: 'controlledBtn',
					delay: '500',
					get isOpen() {
						return isOpen;
					},

					set isOpen($$value) {
						isOpen = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->This is a Tooltip controlled externally.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <hr/> <label><input type="checkbox"${$.attr('checked', isOpen, true)}/> Or you can check this to control the Tooltip state.</label></div></div></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Story($$renderer, {
			name: 'ElementTarget',
			children: ($$renderer) => {
				$$renderer.push(`<div class="tooltip-example"><div class="tooltip-width"><div class="mt-3"><div style="background: lightgreen">A</div> `);

				Tooltip($$renderer, {
					target: myHtmlElementA,
					placement: 'right',
					children: ($$renderer) => {
						$$renderer.push(`<!---->A`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div class="mt-3"><div style="background: lightblue">B</div> `);

				Tooltip($$renderer, {
					target: myHtmlElementB,
					placement: 'right',
					children: ($$renderer) => {
						$$renderer.push(`<!---->B`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div></div></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Story($$renderer, {
			name: 'Theming',
			children: ($$renderer) => {
				$$renderer.push(`<div class="horizontal gap-lg">`);

				Button($$renderer, {
					id: 'btn-dark-theme',
					color: 'dark',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Dark Theme`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					id: 'btn-light-theme',
					color: 'light',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Light Theme`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> `);

				Tooltip($$renderer, {
					theme: 'dark',
					target: 'btn-dark-theme',
					placement: 'top',
					children: ($$renderer) => {
						$$renderer.push(`<!---->This a <strong>dark theme</strong> tooltip!`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Tooltip($$renderer, {
					theme: 'light',
					target: 'btn-light-theme',
					placement: 'top',
					children: ($$renderer) => {
						$$renderer.push(`<!---->This a <strong>light theme</strong> tooltip!`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}