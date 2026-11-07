import * as $ from 'svelte/internal/server';
import { Story, Template } from '@storybook/addon-svelte-csf';
import Progress from './Progress.svelte';

export const meta = {
	title: 'Stories/Progress',
	component: Progress,
	parameters: { controls: { exclude: /^(default)$/g } },
	argTypes: {
		animated: { control: 'boolean' },
		bar: { control: 'boolean' },
		barClassName: { control: 'text' },
		class: { className: 'string', table: { disable: true } },
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
		max: { control: 'number' },
		multi: { control: 'boolean' },
		striped: { control: 'boolean' },
		theme: {
			control: { type: 'select' },
			options: ['dark', 'light', 'auto'],
			description: 'The theme style to apply.',
			table: {
				type: { summary: 'string' },
				defaultValue: { summary: 'auto' }
			}
		},
		value: { control: 'number' },
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
		animated: false,
		bar: false,
		barClassName: '',
		color: 'primary',
		max: 100,
		multi: false,
		striped: false,
		theme: null,
		value: 0
	}
};

export default function Progress_stories($$renderer) {
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

	Template($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(colors);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let color = each_array[$$index];

					Progress($$renderer, $.spread_props([
						args,
						{
							color,
							value: Math.random() * 50 + 50,
							class: 'mb-2',
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(color)}`);
							},
							$$slots: { default: true }
						}
					]));
				}

				$$renderer.push(`<!--]-->`);
			}
		}
	});

	$$renderer.push(`<!----> `);
	Story($$renderer, { name: 'Basic' });
	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Labels',
		children: ($$renderer) => {
			Progress($$renderer, {
				value: 25,
				class: 'mb-2',
				children: ($$renderer) => {
					$$renderer.push(`<!---->25%`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Progress($$renderer, {
				value: 50,
				class: 'mb-2',
				children: ($$renderer) => {
					$$renderer.push(`<!---->1/2`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Progress($$renderer, {
				value: 75,
				class: 'mb-2',
				children: ($$renderer) => {
					$$renderer.push(`<!---->You're almost there!`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Progress($$renderer, {
				color: 'success',
				value: 100,
				class: 'mb-2',
				children: ($$renderer) => {
					$$renderer.push(`<!---->You did it!`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Progress($$renderer, {
				multi: true,
				class: 'mb-2',
				children: ($$renderer) => {
					Progress($$renderer, {
						bar: true,
						value: 15,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Meh`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Progress($$renderer, {
						bar: true,
						color: 'success',
						value: 30,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Wow!`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Progress($$renderer, {
						bar: true,
						color: 'info',
						value: 25,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Cool`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Progress($$renderer, {
						bar: true,
						color: 'warning',
						value: 20,
						children: ($$renderer) => {
							$$renderer.push(`<!---->20%`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Progress($$renderer, {
						bar: true,
						color: 'danger',
						value: 5,
						children: ($$renderer) => {
							$$renderer.push(`<!---->!!`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Striped',
		children: ($$renderer) => {
			Progress($$renderer, { striped: true, value: 2 * 5, class: 'mb-2' });
			$$renderer.push(`<!----> `);
			Progress($$renderer, { striped: true, color: 'success', value: 25, class: 'mb-2' });
			$$renderer.push(`<!----> `);
			Progress($$renderer, { striped: true, color: 'info', value: 50, class: 'mb-2' });
			$$renderer.push(`<!----> `);
			Progress($$renderer, { striped: true, color: 'warning', value: 75, class: 'mb-2' });
			$$renderer.push(`<!----> `);
			Progress($$renderer, { striped: true, color: 'danger', value: 100, class: 'mb-2' });
			$$renderer.push(`<!----> `);

			Progress($$renderer, {
				multi: true,
				class: 'mb-2',
				children: ($$renderer) => {
					Progress($$renderer, { striped: true, bar: true, value: 10 });
					$$renderer.push(`<!----> `);
					Progress($$renderer, { striped: true, bar: true, color: 'success', value: 30 });
					$$renderer.push(`<!----> `);
					Progress($$renderer, { striped: true, bar: true, color: 'warning', value: 20 });
					$$renderer.push(`<!----> `);
					Progress($$renderer, { striped: true, bar: true, color: 'danger', value: 20 });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Animated',
		children: ($$renderer) => {
			Progress($$renderer, { animated: true, value: 2 * 5, class: 'mb-2' });
			$$renderer.push(`<!----> `);
			Progress($$renderer, { animated: true, color: 'success', value: 25, class: 'mb-2' });
			$$renderer.push(`<!----> `);
			Progress($$renderer, { animated: true, color: 'info', value: 50, class: 'mb-2' });
			$$renderer.push(`<!----> `);
			Progress($$renderer, { animated: true, color: 'warning', value: 75, class: 'mb-2' });
			$$renderer.push(`<!----> `);
			Progress($$renderer, { animated: true, color: 'danger', value: 100, class: 'mb-2' });
			$$renderer.push(`<!----> `);

			Progress($$renderer, {
				multi: true,
				class: 'mb-2',
				children: ($$renderer) => {
					Progress($$renderer, { animated: true, bar: true, value: 10 });
					$$renderer.push(`<!----> `);
					Progress($$renderer, { animated: true, bar: true, color: 'success', value: 30 });
					$$renderer.push(`<!----> `);
					Progress($$renderer, { animated: true, bar: true, color: 'warning', value: 20 });
					$$renderer.push(`<!----> `);
					Progress($$renderer, { animated: true, bar: true, color: 'danger', value: 20 });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Multi',
		children: ($$renderer) => {
			$$renderer.push(`<div class="progress-example"><div class="text-content">Plain</div> `);

			Progress($$renderer, {
				multi: true,
				children: ($$renderer) => {
					Progress($$renderer, { bar: true, value: 15 });
					$$renderer.push(`<!----> `);
					Progress($$renderer, { bar: true, color: 'success', value: 20 });
					$$renderer.push(`<!----> `);
					Progress($$renderer, { bar: true, color: 'info', value: 20 });
					$$renderer.push(`<!----> `);
					Progress($$renderer, { bar: true, color: 'warning', value: 20 });
					$$renderer.push(`<!----> `);
					Progress($$renderer, { bar: true, color: 'danger', value: 15 });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <br/> <div class="text-content">With Labels</div> `);

			Progress($$renderer, {
				multi: true,
				children: ($$renderer) => {
					Progress($$renderer, {
						bar: true,
						value: 15,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Meh`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Progress($$renderer, {
						bar: true,
						color: 'success',
						value: 35,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Wow!`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Progress($$renderer, {
						bar: true,
						color: 'warning',
						value: 25,
						children: ($$renderer) => {
							$$renderer.push(`<!---->25%`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Progress($$renderer, {
						bar: true,
						color: 'danger',
						value: 25,
						children: ($$renderer) => {
							$$renderer.push(`<!---->LOOK OUT!!`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <br/> <div class="text-content">Stripes and Animations</div> `);

			Progress($$renderer, {
				multi: true,
				children: ($$renderer) => {
					Progress($$renderer, {
						bar: true,
						striped: true,
						value: 15,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Stripes`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Progress($$renderer, {
						bar: true,
						animated: true,
						color: 'success',
						value: 30,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Animated Stripes`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Progress($$renderer, {
						bar: true,
						color: 'info',
						value: 25,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Plain`);
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
		name: 'Max',
		children: ($$renderer) => {
			$$renderer.push(`<div class="progress-example"><div class="text-content">1 of 5</div> `);
			Progress($$renderer, { value: 1, max: 5 });
			$$renderer.push(`<!----> <br/> <div class="text-content">50 of 135</div> `);
			Progress($$renderer, { value: 50, max: 135 });
			$$renderer.push(`<!----> <br/> <div class="text-content">75 of 111</div> `);
			Progress($$renderer, { value: 75, max: 111 });
			$$renderer.push(`<!----> <br/> <div class="text-content">463 of 500</div> `);
			Progress($$renderer, { value: 463, max: 500 });
			$$renderer.push(`<!----> <br/> <div class="text-content">Various (40) of 55</div> `);

			Progress($$renderer, {
				multi: true,
				children: ($$renderer) => {
					Progress($$renderer, {
						bar: true,
						value: 5,
						max: 55,
						children: ($$renderer) => {
							$$renderer.push(`<!---->5`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Progress($$renderer, {
						bar: true,
						color: 'success',
						value: 15,
						max: 55,
						children: ($$renderer) => {
							$$renderer.push(`<!---->15`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Progress($$renderer, {
						bar: true,
						color: 'warning',
						value: 10,
						max: 55,
						children: ($$renderer) => {
							$$renderer.push(`<!---->10`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Progress($$renderer, {
						bar: true,
						color: 'danger',
						value: 10,
						max: 55,
						children: ($$renderer) => {
							$$renderer.push(`<!---->10`);
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
		name: 'Theming',
		children: ($$renderer) => {
			$$renderer.push(`<div class="progress-example"><div class="text-content">Dark Theme</div> `);

			Progress($$renderer, {
				theme: 'dark',
				value: 25,
				class: 'mb-2',
				children: ($$renderer) => {
					$$renderer.push(`<!---->25%`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);
			Progress($$renderer, { theme: 'dark', striped: true, value: 2 * 5, class: 'mb-2' });
			$$renderer.push(`<!----> `);
			Progress($$renderer, { theme: 'dark', animated: true, value: 2 * 5, class: 'mb-2' });
			$$renderer.push(`<!----> <div class="text-content">Light Theme</div> `);

			Progress($$renderer, {
				theme: 'light',
				value: 25,
				class: 'mb-2',
				children: ($$renderer) => {
					$$renderer.push(`<!---->25%`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);
			Progress($$renderer, { theme: 'light', striped: true, value: 2 * 5, class: 'mb-2' });
			$$renderer.push(`<!----> `);
			Progress($$renderer, { theme: 'light', animated: true, value: 2 * 5, class: 'mb-2' });
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}