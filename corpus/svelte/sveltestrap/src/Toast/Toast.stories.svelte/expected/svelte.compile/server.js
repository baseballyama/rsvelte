import * as $ from 'svelte/internal/server';
import { Story, Template } from '@storybook/addon-svelte-csf';
import { Button, Icon, ToastBody, ToastHeader } from '@sveltestrap/sveltestrap';
import Toast from './Toast.svelte';

export const meta = {
	title: 'Stories/Toast',
	component: Toast,
	parameters: {
		controls: { exclude: /^(close|closing|default|open|opening)$/g }
	},
	argTypes: {
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
			],
			description: 'Color of the Toast background.',
			table: {
				type: { summary: 'string' },
				defaultValue: { summary: 'primary' }
			}
		},
		class: { className: 'string', table: { disable: true } },
		autohide: { control: 'boolean' },
		body: { control: 'boolean' },
		delay: { control: 'number' },
		duration: { control: 'number' },
		fade: { control: 'boolean' },
		header: { control: 'text', table: { disable: true } },
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
		toggle: { control: 'null', table: { disable: true } },
		'on:open': {
			control: false,
			description: 'This event is fired once the Toast has opened.',
			table: {
				category: 'events',
				type: { summary: 'Function' },
				defaultValue: { summary: 'null' }
			}
		},
		'on:opening': {
			control: false,
			description: 'This event is fired immediately once open has been triggered.',
			table: {
				category: 'events',
				type: { summary: 'Function' },
				defaultValue: { summary: 'null' }
			}
		},
		'on:close': {
			description: 'This event is fired once the Toast has closed.',
			table: {
				category: 'events',
				type: { summary: 'Function' },
				defaultValue: { summary: 'null' }
			}
		},
		'on:closing': {
			description: 'This event is fired immediately once close has been triggered.',
			table: {
				category: 'events',
				type: { summary: 'Function' },
				defaultValue: { summary: 'null' }
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
		color: 'primary',
		autohide: false,
		body: false,
		delay: 5000,
		duration: 200,
		fade: true,
		isOpen: true
	}
};

export default function Toast_stories($$renderer) {
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

	let isOpen = false;
	let status = 'Closed';

	function toggle() {
		isOpen = !isOpen;
	}

	function reopen() {
		isOpen = true;
	}

	let seconds = 5;
	let countdownInterval = null;

	function startCountdown() {
		countdownInterval = setInterval(
			() => {
				if (seconds <= 0) {
					clearInterval(countdownInterval);
				} else {
					seconds--;
				}
			},
			1000
		);
	}

	function startCount() {
		isOpen = true;
		seconds = 5;
		clearInterval(countdownInterval);
		countdownInterval = null;
		startCountdown();
	}

	const basicStorySource = `
<div class="p-3 bg-primary mb-3 rounded">
  <Toast>
    <ToastHeader>Sveltestrap</ToastHeader>
    <ToastBody>
      This is a toast on a primary background — check it out!
    </ToastBody>
  </Toast>
</div>`;

	Template($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				$$renderer.push(`<div class="toast-width"><div${$.attr_class(`p-3 bg-${$.stringify(args.color)} mb-3 rounded`)}>`);

				Toast($$renderer, $.spread_props([
					args,
					{
						theme: args.theme || null,
						style: `--bs-toast-color: ${args.theme === 'dark' ? '#fff' : '#111'};`,
						class: 'me-1',
						children: ($$renderer) => {
							ToastHeader($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Sveltestrap`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ToastBody($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->This is a toast on a ${$.escape(args.color)} background — check it out!`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					}
				]));

				$$renderer.push(`<!----></div></div>`);
			}
		}
	});

	$$renderer.push(`<!----> `);
	Story($$renderer, { name: 'Basic', source: basicStorySource });
	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Icons',
		children: ($$renderer) => {
			$$renderer.push(`<div class="columns"><!--[-->`);

			const each_array = $.ensure_array_like(colors);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let color = each_array[$$index];

				$$renderer.push(`<div class="column"><div class="p-2 mb-3">`);

				Toast($$renderer, {
					class: 'me-1',
					children: ($$renderer) => {
						ToastHeader($$renderer, {
							icon: color,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(color)}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ToastBody($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->This is a toast with a ${$.escape(color)} icon.`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div></div>`);
			}

			$$renderer.push(`<!--]--> <div class="column"><div class="p-2 mb-3">`);

			Toast($$renderer, {
				class: 'me-1',
				children: ($$renderer) => {
					ToastHeader($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Sveltestrap`);
						},

						$$slots: {
							default: true,
							icon: ($$renderer) => {
								Icon($$renderer, { slot: 'icon', name: 'emoji-sunglasses', class: 'me-2' });
							}
						}
					});

					$$renderer.push(`<!----> `);

					ToastBody($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->This is a toast with a custom icon.`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Dismissible',
		children: ($$renderer) => {
			Toast($$renderer, {
				isOpen,
				children: ($$renderer) => {
					ToastHeader($$renderer, {
						toggle,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Toast title`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ToastBody($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
      consequat.`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			if (!isOpen) {
				$$renderer.push('<!--[0-->');

				Button($$renderer, {
					color: 'primary',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Show Toast`);
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Autohide',
		children: ($$renderer) => {
			Button($$renderer, {
				color: 'primary',
				disabled: isOpen,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Show Toast that autohides`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Toast($$renderer, {
				autohide: true,
				body: true,
				header: `Autohides in ${$.stringify(seconds)} sec`,
				isOpen,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
    aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Events',
		children: ($$renderer) => {
			$$renderer.push(`<div class="toast-events"><h5>Current state: ${$.escape(status)}</h5> `);

			Button($$renderer, {
				color: 'danger',
				children: ($$renderer) => {
					$$renderer.push(`<!---->${$.escape(isOpen ? 'Close' : 'Open')} Toast`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			$.css_props($$renderer, true, { '--bs-toast-color': '#fff' }, () => {
				Toast($$renderer, {
					body: true,
					theme: 'dark',
					header: 'It\'s Toasterific',
					isOpen,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
      consequat.`);
					},
					$$slots: { default: true }
				});
			});

			$$renderer.push(`</div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Theming',
		children: ($$renderer) => {
			$$renderer.push(`<div class="horizontal gap-lg toast-events">`);

			Toast($$renderer, {
				body: true,
				theme: 'dark',
				header: 'Dark Theme',
				style: '--bs-toast-color: #fff;',
				isOpen: true,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
      consequat.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Toast($$renderer, {
				theme: 'light',
				style: '--bs-toast-color: #000;',
				children: ($$renderer) => {
					ToastHeader($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Light Theme`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ToastBody($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
        magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
        consequat.`);
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

	$$renderer.push(`<!---->`);
}