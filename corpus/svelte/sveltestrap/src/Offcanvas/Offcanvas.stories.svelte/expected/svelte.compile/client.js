import 'svelte/internal/disclose-version';
import Offcanvas from './Offcanvas.svelte';
import * as $ from 'svelte/internal/client';
import { Story, Template } from '@storybook/addon-svelte-csf';
import { Button } from '@sveltestrap/sveltestrap';

export const meta = {
	title: 'Stories/Offcanvas',
	component: Offcanvas,
	parameters: { controls: { exclude: /^(default)$/g } },
	argTypes: {
		class: { control: false, table: { disable: true } },
		backdrop: { control: 'boolean' },
		body: { control: 'boolean' },
		fade: { control: 'boolean' },
		header: { control: '' },
		isOpen: { control: false, table: { disable: true } },
		keyboard: { control: 'boolean' },
		placement: {
			control: { type: 'select' },
			options: ['start', 'end', 'top', 'bottom']
		},
		scroll: { control: 'boolean' },
		style: { control: '' },
		sm: { control: 'boolean' },
		md: { control: 'boolean' },
		lg: { control: 'boolean' },
		xl: { control: 'boolean' },
		xxl: { control: 'boolean' },
		theme: {
			control: { type: 'select' },
			options: ['dark', 'light', 'auto'],
			description: 'The theme style to apply.',
			table: {
				type: { summary: 'string' },
				defaultValue: { summary: 'auto' }
			}
		},
		'header ': {
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
		backdrop: true,
		body: true,
		class: '',
		container: 'body',
		fade: true,
		header: 'Offcanvas',
		isOpen: false,
		keyboard: true,
		placement: 'start',
		scroll: false,
		sm: false,
		md: false,
		lg: false,
		xl: false,
		xxl: false,
		style: '',
		theme: null,
		toggle: undefined
	}
};

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <code> </code> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<h1 slot="header"><i>Hello <b>World!</b></i></h1>`);

var root_4 = $.from_html(
	`<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua.</p> <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua.</p> <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua.</p> <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua.</p> <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua.</p> <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua.</p> <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua.</p> <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua.</p> <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua.</p> <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua.</p> <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua.</p> <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua.</p> <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua.</p> <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua.</p>`,
	1
);

var root_5 = $.from_html(`<div><img src="https://picsum.photos/150/1200" alt="Meaningless content"/></div>`);
var root_6 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_7 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Offcanvas_stories($$anchor) {
	let isOpen = false;
	let status = 'Closed';
	let endOpen = false;
	let bottomOpen = false;
	let topOpen = false;
	const toggleEnd = () => endOpen = !endOpen;
	const toggleBottom = () => bottomOpen = !bottomOpen;
	const toggleTop = () => topOpen = !topOpen;

	const toggle = () => {
		isOpen = !isOpen;
	};

	const basicSource = `<Button color="primary" on:click={toggle}>Open Start</Button>

<Offcanvas {isOpen} {toggle} header="Start">
  Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
  tempor incididunt ut labore et dolore magna aliqua.
</Offcanvas>`;

	var fragment = root_7();
	var node = $.first_child(fragment);

	Story(node, {
		name: 'Basic',
		source: basicSource,
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				Button(node_1, {
					color: 'primary capitalize',
					$$events: { click: toggle },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text();

						$.template_effect(() => $.set_text(text, `Open ${$.get(args).placement ?? ''}`));
						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				var node_2 = $.sibling(node_1, 2);

				Offcanvas(node_2, $.spread_props(() => $.get(args), {
					get isOpen() {
						return isOpen;
					},
					toggle,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna\n    aliqua.');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				}));

				$.append($$anchor, fragment_1);
			}
		}
	});

	var node_3 = $.sibling(node, 2);

	Story(node_3, {
		name: 'Backdrop',
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root();
			var node_4 = $.first_child(fragment_3);

			Button(node_4, {
				color: 'primary',
				$$events: { click: toggle },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Open');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			Offcanvas(node_5, {
				header: 'No Backdrop',
				backdrop: false,
				get isOpen() {
					return isOpen;
				},
				toggle,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Look ma, no backdrop.');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_3, 2);

	Story(node_6, {
		name: 'Events',
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root_1();
			var node_7 = $.first_child(fragment_4);

			Button(node_7, {
				color: 'primary',
				$$events: { click: toggle },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Open');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			var code = $.sibling(node_7, 2);
			var text_5 = $.only_child(code);
			var node_8 = $.sibling(code, 2);

			Offcanvas(node_8, {
				get isOpen() {
					return isOpen;
				},
				toggle,
				placement: 'end',
				$$events: {
					opening: () => status = 'Opening...',
					open: () => status = 'Opened',
					closing: () => status = 'Closing...',
					close: () => status = 'Closed'
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_6 = $.text('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna\n    aliqua.');

					$.append($$anchor, text_6);
				},
				$$slots: { default: true }
			});

			$.template_effect(() => $.set_text(text_5, `  Current state: ${status ?? ''}`));
			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_6, 2);

	Story(node_9, {
		name: 'Placement',
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = root_2();
			var node_10 = $.first_child(fragment_5);

			Button(node_10, {
				color: 'danger',
				$$events: { click: toggle },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_7 = $.text('Start');

					$.append($$anchor, text_7);
				},
				$$slots: { default: true }
			});

			var node_11 = $.sibling(node_10, 2);

			Button(node_11, {
				color: 'warning',
				$$events: { click: () => endOpen = !endOpen },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_8 = $.text('End');

					$.append($$anchor, text_8);
				},
				$$slots: { default: true }
			});

			var node_12 = $.sibling(node_11, 2);

			Button(node_12, {
				color: 'success',
				$$events: { click: () => topOpen = !topOpen },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_9 = $.text('Top');

					$.append($$anchor, text_9);
				},
				$$slots: { default: true }
			});

			var node_13 = $.sibling(node_12, 2);

			Button(node_13, {
				color: 'info',
				$$events: { click: () => bottomOpen = !bottomOpen },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_10 = $.text('Bottom');

					$.append($$anchor, text_10);
				},
				$$slots: { default: true }
			});

			var node_14 = $.sibling(node_13, 2);

			Offcanvas(node_14, {
				get isOpen() {
					return isOpen;
				},
				toggle,
				header: 'Start',
				placement: 'start',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_11 = $.text('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna\n    aliqua.');

					$.append($$anchor, text_11);
				},
				$$slots: { default: true }
			});

			var node_15 = $.sibling(node_14, 2);

			Offcanvas(node_15, {
				get isOpen() {
					return endOpen;
				},
				toggle: toggleEnd,
				placement: 'end',
				header: 'Right',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_12 = $.text('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna\n    aliqua.');

					$.append($$anchor, text_12);
				},
				$$slots: { default: true }
			});

			var node_16 = $.sibling(node_15, 2);

			Offcanvas(node_16, {
				get isOpen() {
					return topOpen;
				},
				toggle: toggleTop,
				placement: 'top',
				header: 'Top',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_13 = $.text('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna\n    aliqua.');

					$.append($$anchor, text_13);
				},
				$$slots: { default: true }
			});

			var node_17 = $.sibling(node_16, 2);

			Offcanvas(node_17, {
				get isOpen() {
					return bottomOpen;
				},
				toggle: toggleBottom,
				placement: 'bottom',
				header: 'Bottom',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_14 = $.text('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna\n    aliqua.');

					$.append($$anchor, text_14);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});

	var node_18 = $.sibling(node_9, 2);

	Story(node_18, {
		name: 'Slots',
		children: ($$anchor, $$slotProps) => {
			var fragment_6 = root();
			var node_19 = $.first_child(fragment_6);

			Button(node_19, {
				color: 'primary',
				$$events: { click: toggle },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_15 = $.text('Open');

					$.append($$anchor, text_15);
				},
				$$slots: { default: true }
			});

			var node_20 = $.sibling(node_19, 2);

			Offcanvas(node_20, {
				scroll: true,
				get isOpen() {
					return isOpen;
				},
				toggle,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_16 = $.text('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna\n    aliqua.');

					$.append($$anchor, text_16);
				},

				$$slots: {
					default: true,
					header: ($$anchor, $$slotProps) => {
						var h1 = root_3();

						$.append($$anchor, h1);
					}
				}
			});

			$.append($$anchor, fragment_6);
		},
		$$slots: { default: true }
	});

	var node_21 = $.sibling(node_18, 2);

	Story(node_21, {
		name: 'Manual',
		children: ($$anchor, $$slotProps) => {
			var fragment_7 = root();
			var node_22 = $.first_child(fragment_7);

			Button(node_22, {
				color: 'primary',
				$$events: { click: () => isOpen = true },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_17 = $.text('Open');

					$.append($$anchor, text_17);
				},
				$$slots: { default: true }
			});

			var node_23 = $.sibling(node_22, 2);

			Offcanvas(node_23, {
				header: 'No toggle or esc',
				scroll: true,
				get isOpen() {
					return isOpen;
				},

				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						color: 'danger',
						$$events: { click: () => isOpen = false },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_18 = $.text('Close Me');

							$.append($$anchor, text_18);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_7);
		},
		$$slots: { default: true }
	});

	var node_24 = $.sibling(node_21, 2);

	Story(node_24, {
		name: 'Scrolling',
		children: ($$anchor, $$slotProps) => {
			var fragment_9 = root();
			var node_25 = $.first_child(fragment_9);

			Button(node_25, {
				color: 'primary',
				$$events: { click: toggle },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_19 = $.text('Open');

					$.append($$anchor, text_19);
				},
				$$slots: { default: true }
			});

			var node_26 = $.sibling(node_25, 2);

			Offcanvas(node_26, {
				header: 'You can scroll the body',
				scroll: true,
				get isOpen() {
					return isOpen;
				},
				toggle,
				backdrop: false,
				children: ($$anchor, $$slotProps) => {
					var fragment_10 = root_4();

					$.next(26);
					$.append($$anchor, fragment_10);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_9);
		},
		$$slots: { default: true }
	});

	var node_27 = $.sibling(node_24, 2);

	Story(node_27, {
		name: 'Custom',
		children: ($$anchor, $$slotProps) => {
			var fragment_11 = root();
			var node_28 = $.first_child(fragment_11);

			Button(node_28, {
				color: 'primary',
				$$events: { click: () => isOpen = true },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_20 = $.text('Open');

					$.append($$anchor, text_20);
				},
				$$slots: { default: true }
			});

			var node_29 = $.sibling(node_28, 2);

			Offcanvas(node_29, {
				get isOpen() {
					return isOpen;
				},
				body: false,
				style: 'width: 150px',
				class: 'bg-danger',
				children: ($$anchor, $$slotProps) => {
					var div = root_5();

					$.event('click', div, () => isOpen = false);
					$.append($$anchor, div);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_11);
		},
		$$slots: { default: true }
	});

	var node_30 = $.sibling(node_27, 2);

	Story(node_30, {
		name: 'Theming',
		children: ($$anchor, $$slotProps) => {
			var fragment_12 = root_6();
			var node_31 = $.first_child(fragment_12);

			Button(node_31, {
				color: 'dark',
				$$events: { click: toggle },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_21 = $.text('Dark Theme');

					$.append($$anchor, text_21);
				},
				$$slots: { default: true }
			});

			var node_32 = $.sibling(node_31, 2);

			Button(node_32, {
				color: 'light',
				$$events: { click: () => endOpen = !endOpen },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_22 = $.text('Light Theme');

					$.append($$anchor, text_22);
				},
				$$slots: { default: true }
			});

			var node_33 = $.sibling(node_32, 2);

			Offcanvas(node_33, {
				theme: 'dark',
				get isOpen() {
					return isOpen;
				},
				toggle,
				header: 'Dark Theme',
				placement: 'start',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_23 = $.text('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna\n    aliqua.');

					$.append($$anchor, text_23);
				},
				$$slots: { default: true }
			});

			var node_34 = $.sibling(node_33, 2);

			Offcanvas(node_34, {
				theme: 'light',
				get isOpen() {
					return endOpen;
				},
				toggle: toggleEnd,
				header: 'Light Theme',
				placement: 'end',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_24 = $.text('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna\n    aliqua.');

					$.append($$anchor, text_24);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_12);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}