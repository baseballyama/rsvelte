import 'svelte/internal/disclose-version';
import Toast from './Toast.svelte';
import * as $ from 'svelte/internal/client';
import { Story, Template } from '@storybook/addon-svelte-csf';
import { Button, Icon, ToastBody, ToastHeader } from '@sveltestrap/sveltestrap';

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

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="toast-width"><div><!></div></div>`);
var root_2 = $.from_html(`<div class="column"><div class="p-2 mb-3"><!></div></div>`);
var root_3 = $.from_html(`<div class="columns"><!> <div class="column"><div class="p-2 mb-3"><!></div></div></div>`);
var root_4 = $.from_html(`<div class="toast-events"><h5> </h5> <!> <svelte-css-wrapper style="display: contents"><!></svelte-css-wrapper></div>`);
var root_5 = $.from_html(`<div class="horizontal gap-lg toast-events"><!> <!></div>`);
var root_6 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Toast_stories($$anchor) {
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

	var fragment = root_6();
	var node = $.first_child(fragment);

	Template(node, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);
				var div = root_1();
				var div_1 = $.child(div);
				var node_1 = $.child(div_1);

				{
					let $0 = $.derived(() => $.get(args).theme || null);
					let $1 = $.derived(() => $.get(args).theme === 'dark' ? '#fff' : '#111');

					Toast(node_1, $.spread_props(() => $.get(args), {
						get theme() {
							return $.get($0);
						},

						get style() {
							return `--bs-toast-color: ${$.get($1) ?? ''};`;
						},
						class: 'me-1',
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root();
							var node_2 = $.first_child(fragment_1);

							ToastHeader(node_2, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Sveltestrap');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});

							var node_3 = $.sibling(node_2, 2);

							ToastBody(node_3, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text();

									$.template_effect(() => $.set_text(text_1, `This is a toast on a ${$.get(args).color ?? ''} background — check it out!`));
									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					}));
				}

				$.reset(div_1);
				$.reset(div);
				$.template_effect(() => $.set_class(div_1, 1, `p-3 bg-${$.get(args).color ?? ''} mb-3 rounded`));
				$.append($$anchor, div);
			}
		}
	});

	var node_4 = $.sibling(node, 2);

	Story(node_4, { name: 'Basic', source: basicStorySource });

	var node_5 = $.sibling(node_4, 2);

	Story(node_5, {
		name: 'Icons',
		children: ($$anchor, $$slotProps) => {
			var div_2 = root_3();
			var node_6 = $.child(div_2);

			$.each(node_6, 17, () => colors, $.index, ($$anchor, color) => {
				var div_3 = root_2();
				var div_4 = $.child(div_3);
				var node_7 = $.child(div_4);

				Toast(node_7, {
					class: 'me-1',
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root();
						var node_8 = $.first_child(fragment_3);

						ToastHeader(node_8, {
							get icon() {
								return $.get(color);
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_2 = $.text();

								$.template_effect(() => $.set_text(text_2, $.get(color)));
								$.append($$anchor, text_2);
							},
							$$slots: { default: true }
						});

						var node_9 = $.sibling(node_8, 2);

						ToastBody(node_9, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_3 = $.text();

								$.template_effect(() => $.set_text(text_3, `This is a toast with a ${$.get(color) ?? ''} icon.`));
								$.append($$anchor, text_3);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});

				$.reset(div_4);
				$.reset(div_3);
				$.append($$anchor, div_3);
			});

			var div_5 = $.sibling(node_6, 2);
			var div_6 = $.child(div_5);
			var node_10 = $.child(div_6);

			Toast(node_10, {
				class: 'me-1',
				children: ($$anchor, $$slotProps) => {
					var fragment_6 = root();
					var node_11 = $.first_child(fragment_6);

					ToastHeader(node_11, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Sveltestrap');

							$.append($$anchor, text_4);
						},

						$$slots: {
							default: true,
							icon: ($$anchor, $$slotProps) => {
								Icon($$anchor, { slot: 'icon', name: 'emoji-sunglasses', class: 'me-2' });
							}
						}
					});

					var node_12 = $.sibling(node_11, 2);

					ToastBody(node_12, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('This is a toast with a custom icon.');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_6);
				},
				$$slots: { default: true }
			});

			$.reset(div_6);
			$.reset(div_5);
			$.reset(div_2);
			$.append($$anchor, div_2);
		},
		$$slots: { default: true }
	});

	var node_13 = $.sibling(node_5, 2);

	Story(node_13, {
		name: 'Dismissible',
		children: ($$anchor, $$slotProps) => {
			var fragment_8 = root();
			var node_14 = $.first_child(fragment_8);

			Toast(node_14, {
				get isOpen() {
					return isOpen;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_9 = root();
					var node_15 = $.first_child(fragment_9);

					ToastHeader(node_15, {
						toggle,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text('Toast title');

							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});

					var node_16 = $.sibling(node_15, 2);

					ToastBody(node_16, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore\n      magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo\n      consequat.');

							$.append($$anchor, text_7);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_9);
				},
				$$slots: { default: true }
			});

			var node_17 = $.sibling(node_14, 2);

			{
				var consequent = ($$anchor) => {
					Button($$anchor, {
						color: 'primary',
						$$events: { click: reopen },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_8 = $.text('Show Toast');

							$.append($$anchor, text_8);
						},
						$$slots: { default: true }
					});
				};

				$.if(node_17, ($$render) => {
					if (!isOpen) $$render(consequent);
				});
			}

			$.append($$anchor, fragment_8);
		},
		$$slots: { default: true }
	});

	var node_18 = $.sibling(node_13, 2);

	Story(node_18, {
		name: 'Autohide',
		children: ($$anchor, $$slotProps) => {
			var fragment_11 = root();
			var node_19 = $.first_child(fragment_11);

			Button(node_19, {
				color: 'primary',
				get disabled() {
					return isOpen;
				},
				$$events: { click: startCount },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_9 = $.text('Show Toast that autohides');

					$.append($$anchor, text_9);
				},
				$$slots: { default: true }
			});

			var node_20 = $.sibling(node_19, 2);

			Toast(node_20, {
				autohide: true,
				body: true,
				get header() {
					return `Autohides in ${seconds ?? ''} sec`;
				},

				get isOpen() {
					return isOpen;
				},
				$$events: { close: () => isOpen = false },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_10 = $.text('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna\n    aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.');

					$.append($$anchor, text_10);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_11);
		},
		$$slots: { default: true }
	});

	var node_21 = $.sibling(node_18, 2);

	Story(node_21, {
		name: 'Events',
		children: ($$anchor, $$slotProps) => {
			var div_7 = root_4();
			var h5 = $.child(div_7);
			var text_11 = $.only_child(h5);
			var node_22 = $.sibling(h5, 2);

			Button(node_22, {
				color: 'danger',
				$$events: { click: toggle },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_12 = $.text();

					$.template_effect(() => $.set_text(text_12, `${isOpen ? 'Close' : 'Open'} Toast`));
					$.append($$anchor, text_12);
				},
				$$slots: { default: true }
			});

			var node_23 = $.sibling(node_22, 2);

			{
				$.css_props(node_23, () => ({ '--bs-toast-color': '#fff' }));

				Toast(node_23.lastChild, {
					body: true,
					theme: 'dark',
					header: 'It\'s Toasterific',
					get isOpen() {
						return isOpen;
					},

					$$events: {
						open: () => status = 'Opened',
						opening: () => status = 'Opening...',
						closing: () => status = 'Closing...',
						close: () => status = 'Closed'
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_13 = $.text('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore\n      magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo\n      consequat.');

						$.append($$anchor, text_13);
					},
					$$slots: { default: true }
				});

				$.reset(node_23);
			}

			$.reset(div_7);
			$.template_effect(() => $.set_text(text_11, `Current state: ${status ?? ''}`));
			$.append($$anchor, div_7);
		},
		$$slots: { default: true }
	});

	var node_24 = $.sibling(node_21, 2);

	Story(node_24, {
		name: 'Theming',
		children: ($$anchor, $$slotProps) => {
			var div_8 = root_5();
			var node_25 = $.child(div_8);

			Toast(node_25, {
				body: true,
				theme: 'dark',
				header: 'Dark Theme',
				style: '--bs-toast-color: #fff;',
				isOpen: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_14 = $.text('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore\n      magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo\n      consequat.');

					$.append($$anchor, text_14);
				},
				$$slots: { default: true }
			});

			var node_26 = $.sibling(node_25, 2);

			Toast(node_26, {
				theme: 'light',
				style: '--bs-toast-color: #000;',
				children: ($$anchor, $$slotProps) => {
					var fragment_13 = root();
					var node_27 = $.first_child(fragment_13);

					ToastHeader(node_27, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_15 = $.text('Light Theme');

							$.append($$anchor, text_15);
						},
						$$slots: { default: true }
					});

					var node_28 = $.sibling(node_27, 2);

					ToastBody(node_28, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_16 = $.text('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore\n        magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo\n        consequat.');

							$.append($$anchor, text_16);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_13);
				},
				$$slots: { default: true }
			});

			$.reset(div_8);
			$.append($$anchor, div_8);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}