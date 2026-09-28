import 'svelte/internal/disclose-version';
import Tooltip from './Tooltip.svelte';
import * as $ from 'svelte/internal/client';
import { Story, Template } from '@storybook/addon-svelte-csf';
import { Button } from '@sveltestrap/sveltestrap';

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

var root = $.from_html(`<div class="mt-3"><!> <!></div>`);
var root_1 = $.from_html(`<strong>Hello</strong> <i>World</i>!`, 1);
var root_2 = $.from_html(`<div><!> <!></div>`);
var root_3 = $.from_html(`<div class="tooltip-example"><div class="text-content"><div class="mt-3"><!> <!> <hr/> <label><input type="checkbox"/> Or you can check this to control the Tooltip state.</label></div></div></div>`);
var root_4 = $.from_html(`<div class="tooltip-example"><div class="tooltip-width"><div class="mt-3"><div style="background: lightgreen">A</div> <!></div> <div class="mt-3"><div style="background: lightblue">B</div> <!></div></div></div>`);
var root_5 = $.from_html(`This a <strong>dark theme</strong> tooltip!`, 1);
var root_6 = $.from_html(`This a <strong>light theme</strong> tooltip!`, 1);
var root_7 = $.from_html(`<div class="horizontal gap-lg"><!> <!></div> <!> <!>`, 1);
var root_8 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Tooltip_stories($$anchor) {
	const placements = ['top', 'right', 'left', 'bottom'];
	let isOpen = false;
	let myHtmlElementA;
	let myHtmlElementB;
	var fragment = root_8();
	var node = $.first_child(fragment);

	Template(node, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.key(node_1, () => $.get(args), ($$anchor) => {
					var div = root();
					var node_2 = $.child(div);

					{
						let $0 = $.derived(() => `btn-${$.get(args).placement}`);

						Button(node_2, {
							get id() {
								return $.get($0);
							},
							color: 'primary',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(() => $.set_text(text, `Show ${$.get(args).placement ?? ''}`));
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					}

					var node_3 = $.sibling(node_2, 2);

					{
						let $0 = $.derived(() => `btn-${$.get(args).placement}`);

						Tooltip(node_3, $.spread_props(() => $.get(args), {
							get target() {
								return $.get($0);
							},
							'args.placement': true,
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text();

								$.template_effect(() => $.set_text(text_1, `${$.get(args).placement ?? ''} tooltip!`));
								$.append($$anchor, text_1);
							},
							$$slots: { default: true }
						}));
					}

					$.reset(div);
					$.append($$anchor, div);
				});

				$.append($$anchor, fragment_1);
			}
		}
	});

	var node_4 = $.sibling(node, 2);

	Story(node_4, { name: 'Basic' });

	var node_5 = $.sibling(node_4, 2);

	Story(node_5, {
		name: 'HTML',
		children: ($$anchor, $$slotProps) => {
			var div_1 = root_2();
			var node_6 = $.child(div_1);

			Button(node_6, {
				id: 'btn-right-html',
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('HTML Tooltips');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_6, 2);

			Tooltip(node_7, {
				target: 'btn-right-html',
				placement: 'right',
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_1();

					$.next(3);
					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			$.reset(div_1);
			$.append($$anchor, div_1);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_5, 2);

	Story(node_8, {
		name: 'Controlled',
		children: ($$anchor, $$slotProps) => {
			var div_2 = root_3();
			var div_3 = $.child(div_2);
			var div_4 = $.child(div_3);
			var node_9 = $.child(div_4);

			Button(node_9, {
				id: 'controlledBtn',
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('You could hover here');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_9, 2);

			Tooltip(node_10, {
				placement: 'right',
				target: 'controlledBtn',
				delay: '500',
				get isOpen() {
					return isOpen;
				},

				set isOpen($$value) {
					isOpen = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('This is a Tooltip controlled externally.');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			var label = $.sibling(node_10, 4);
			var input = $.child(label);

			$.remove_input_defaults(input);
			$.next();
			$.reset(label);
			$.reset(div_4);
			$.reset(div_3);
			$.reset(div_2);
			$.bind_checked(input, () => isOpen, ($$value) => isOpen = $$value);
			$.append($$anchor, div_2);
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_8, 2);

	Story(node_11, {
		name: 'ElementTarget',
		children: ($$anchor, $$slotProps) => {
			var div_5 = root_4();
			var div_6 = $.child(div_5);
			var div_7 = $.child(div_6);
			var div_8 = $.child(div_7);

			$.bind_this(div_8, ($$value) => myHtmlElementA = $$value, () => myHtmlElementA);

			var node_12 = $.sibling(div_8, 2);

			Tooltip(node_12, {
				get target() {
					return myHtmlElementA;
				},
				placement: 'right',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('A');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});

			$.reset(div_7);

			var div_9 = $.sibling(div_7, 2);
			var div_10 = $.child(div_9);

			$.bind_this(div_10, ($$value) => myHtmlElementB = $$value, () => myHtmlElementB);

			var node_13 = $.sibling(div_10, 2);

			Tooltip(node_13, {
				get target() {
					return myHtmlElementB;
				},
				placement: 'right',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_6 = $.text('B');

					$.append($$anchor, text_6);
				},
				$$slots: { default: true }
			});

			$.reset(div_9);
			$.reset(div_6);
			$.reset(div_5);
			$.append($$anchor, div_5);
		},
		$$slots: { default: true }
	});

	var node_14 = $.sibling(node_11, 2);

	Story(node_14, {
		name: 'Theming',
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = root_7();
			var div_11 = $.first_child(fragment_5);
			var node_15 = $.child(div_11);

			Button(node_15, {
				id: 'btn-dark-theme',
				color: 'dark',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_7 = $.text('Dark Theme');

					$.append($$anchor, text_7);
				},
				$$slots: { default: true }
			});

			var node_16 = $.sibling(node_15, 2);

			Button(node_16, {
				id: 'btn-light-theme',
				color: 'light',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_8 = $.text('Light Theme');

					$.append($$anchor, text_8);
				},
				$$slots: { default: true }
			});

			$.reset(div_11);

			var node_17 = $.sibling(div_11, 2);

			Tooltip(node_17, {
				theme: 'dark',
				target: 'btn-dark-theme',
				placement: 'top',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_6 = root_5();

					$.next(2);
					$.append($$anchor, fragment_6);
				},
				$$slots: { default: true }
			});

			var node_18 = $.sibling(node_17, 2);

			Tooltip(node_18, {
				theme: 'light',
				target: 'btn-light-theme',
				placement: 'top',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_7 = root_6();

					$.next(2);
					$.append($$anchor, fragment_7);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}