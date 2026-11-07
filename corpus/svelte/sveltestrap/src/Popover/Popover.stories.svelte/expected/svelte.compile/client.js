import 'svelte/internal/disclose-version';
import Popover from './Popover.svelte';
import * as $ from 'svelte/internal/client';
import { Story } from '@storybook/addon-svelte-csf';
import { Button } from '@sveltestrap/sveltestrap';

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

var root = $.from_html(`This Popover is using <b> </b> placement.`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`This Popover placement is <b> </b>.`, 1);
var root_3 = $.from_html(`<div class="horizontal"></div>`);
var root_4 = $.from_html(`<div class="horizontal"><div><!> <!></div> <div><!> <!></div> <div><!> <!></div></div>`);
var root_5 = $.from_html(`<div slot="title"><i>Hello</i> <b>World!</b></div>`);
var root_6 = $.from_html(`<div slot="title" style="color: #fff;"><i>Hello</i> <b>World!</b></div>`);
var root_7 = $.from_html(`<div class="horizontal gap-lg"><!> <!></div> <!> <!>`, 1);
var root_8 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Popover_stories($$anchor) {
	const placements = ['top', 'right', 'left', 'bottom', 'auto'];
	const colors = ['primary', 'success', 'danger', 'warning'];

	const basicSource = `<Button color="primary" id="btn-top-basic">Show on top</Button>

<Popover
  target="btn-top-basic"
  placement="top"
  title="Popover Top">
  This Popover will be shown above the trigger element.
</Popover>`;

	var fragment = root_8();
	var node = $.first_child(fragment);

	Story(node, {
		name: 'Basic',
		source: basicSource,
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				Button(node_1, {
					color: 'primary',
					id: 'btn-top-basic',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text();

						$.template_effect(() => $.set_text(text, `Show on ${$.get(args).placement ?? ''}`));
						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				var node_2 = $.sibling(node_1, 2);

				$.key(node_2, () => $.get(args), ($$anchor) => {
					{
						let $0 = $.derived(() => $.get(args).theme === 'dark' ? 'color: #fff;' : '');

						Popover($$anchor, $.spread_props(() => $.get(args), {
							target: 'btn-top-basic',
							get style() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var fragment_4 = root();
								var b = $.sibling($.first_child(fragment_4));
								var text_1 = $.only_child(b, true);

								$.next();
								$.template_effect(() => $.set_text(text_1, $.get(args).placement));
								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						}));
					}
				});

				$.append($$anchor, fragment_1);
			}
		}
	});

	var node_3 = $.sibling(node, 2);

	Story(node_3, {
		name: 'Placement',
		children: ($$anchor, $$slotProps) => {
			var div = root_3();

			$.each(div, 21, () => placements, $.index, ($$anchor, placement, index) => {
				var fragment_5 = root_1();
				var node_4 = $.first_child(fragment_5);

				Button(node_4, {
					get color() {
						return colors[index];
					},

					get id() {
						return `btn-${$.get(placement) ?? ''}`;
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text();

						$.template_effect(() => $.set_text(text_2, `Show on ${$.get(placement) ?? ''}`));
						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});

				var node_5 = $.sibling(node_4, 2);

				Popover(node_5, {
					get target() {
						return `btn-${$.get(placement) ?? ''}`;
					},

					get placement() {
						return $.get(placement);
					},

					get title() {
						return `Popover ${$.get(placement) ?? ''}`;
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var fragment_7 = root_2();
						var b_1 = $.sibling($.first_child(fragment_7));
						var text_3 = $.only_child(b_1, true);

						$.next();
						$.template_effect(() => $.set_text(text_3, $.get(placement)));
						$.append($$anchor, fragment_7);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_5);
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_3, 2);

	Story(node_6, {
		name: 'Triggers',
		children: ($$anchor, $$slotProps) => {
			var div_1 = root_4();
			var div_2 = $.child(div_1);
			var node_7 = $.child(div_2);

			Button(node_7, {
				color: 'primary',
				id: 'btn-trigger-click',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Click me');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_7, 2);

			Popover(node_8, {
				trigger: 'click',
				placement: 'top',
				target: 'btn-trigger-click',
				title: 'Popover on click',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('This Popover is shown when clicking on the trigger element.');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});

			$.reset(div_2);

			var div_3 = $.sibling(div_2, 2);
			var node_9 = $.child(div_3);

			Button(node_9, {
				color: 'warning',
				id: 'btn-trigger-hover',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_6 = $.text('Hover me');

					$.append($$anchor, text_6);
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_9, 2);

			Popover(node_10, {
				trigger: 'hover',
				placement: 'right',
				target: 'btn-trigger-hover',
				title: 'Popover with hover',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_7 = $.text('This Popover is shown while hovering over the trigger element.');

					$.append($$anchor, text_7);
				},
				$$slots: { default: true }
			});

			$.reset(div_3);

			var div_4 = $.sibling(div_3, 2);
			var node_11 = $.child(div_4);

			Button(node_11, {
				color: 'danger',
				id: 'btn-trigger-focus',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_8 = $.text('Focus me');

					$.append($$anchor, text_8);
				},
				$$slots: { default: true }
			});

			var node_12 = $.sibling(node_11, 2);

			Popover(node_12, {
				trigger: 'focus',
				placement: 'bottom',
				target: 'btn-trigger-focus',
				title: 'Popover with focus',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_9 = $.text('This Popover is shown while focusing on the trigger element.');

					$.append($$anchor, text_9);
				},
				$$slots: { default: true }
			});

			$.reset(div_4);
			$.reset(div_1);
			$.append($$anchor, div_1);
		},
		$$slots: { default: true }
	});

	var node_13 = $.sibling(node_6, 2);

	Story(node_13, {
		name: 'Dismissible',
		children: ($$anchor, $$slotProps) => {
			var fragment_8 = root_1();
			var node_14 = $.first_child(fragment_8);

			Button(node_14, {
				color: 'primary',
				id: 'btn-dismissible',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_10 = $.text('Click me');

					$.append($$anchor, text_10);
				},
				$$slots: { default: true }
			});

			var node_15 = $.sibling(node_14, 2);

			Popover(node_15, {
				placement: 'right',
				target: 'btn-dismissible',
				dismissible: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_11 = $.text('This Popover is dismissesed when any click occurs.');

					$.append($$anchor, text_11);
				},

				$$slots: {
					default: true,
					title: ($$anchor, $$slotProps) => {
						var div_5 = root_5();

						$.append($$anchor, div_5);
					}
				}
			});

			$.append($$anchor, fragment_8);
		},
		$$slots: { default: true }
	});

	var node_16 = $.sibling(node_13, 2);

	Story(node_16, {
		name: 'OutsideClick',
		children: ($$anchor, $$slotProps) => {
			var fragment_9 = root_1();
			var node_17 = $.first_child(fragment_9);

			Button(node_17, {
				color: 'primary',
				id: 'btn-outside-click',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_12 = $.text('Click me');

					$.append($$anchor, text_12);
				},
				$$slots: { default: true }
			});

			var node_18 = $.sibling(node_17, 2);

			Popover(node_18, {
				placement: 'right',
				target: 'btn-outside-click',
				hideOnOutsideClick: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_13 = $.text('You can click inside this Popover and it will not dismiss. Dismissal will only occur if the click is outside of the popover.');

					$.append($$anchor, text_13);
				},

				$$slots: {
					default: true,
					title: ($$anchor, $$slotProps) => {
						var div_6 = root_5();

						$.append($$anchor, div_6);
					}
				}
			});

			$.append($$anchor, fragment_9);
		},
		$$slots: { default: true }
	});

	var node_19 = $.sibling(node_16, 2);

	Story(node_19, {
		name: 'Theming',
		children: ($$anchor, $$slotProps) => {
			var fragment_10 = root_7();
			var div_7 = $.first_child(fragment_10);
			var node_20 = $.child(div_7);

			Button(node_20, {
				color: 'dark',
				id: 'btn-dark-theme',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_14 = $.text('Show dark theme');

					$.append($$anchor, text_14);
				},
				$$slots: { default: true }
			});

			var node_21 = $.sibling(node_20, 2);

			Button(node_21, {
				color: 'light',
				id: 'btn-light-theme',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_15 = $.text('Show light theme');

					$.append($$anchor, text_15);
				},
				$$slots: { default: true }
			});

			$.reset(div_7);

			var node_22 = $.sibling(div_7, 2);

			Popover(node_22, {
				theme: 'light',
				placement: 'right',
				target: 'btn-light-theme',
				hideOnOutsideClick: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_16 = $.text('You can click inside this Popover and it will not dismiss. Dismissal will only occur if the click is outside of the popover.');

					$.append($$anchor, text_16);
				},

				$$slots: {
					default: true,
					title: ($$anchor, $$slotProps) => {
						var div_8 = root_5();

						$.append($$anchor, div_8);
					}
				}
			});

			var node_23 = $.sibling(node_22, 2);

			Popover(node_23, {
				theme: 'dark',
				placement: 'right',
				target: 'btn-dark-theme',
				hideOnOutsideClick: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_17 = $.text('You can click inside this Popover and it will not dismiss. Dismissal will only occur if the click is outside of the popover.');

					$.append($$anchor, text_17);
				},

				$$slots: {
					default: true,
					title: ($$anchor, $$slotProps) => {
						var div_9 = root_6();

						$.append($$anchor, div_9);
					}
				}
			});

			$.append($$anchor, fragment_10);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}