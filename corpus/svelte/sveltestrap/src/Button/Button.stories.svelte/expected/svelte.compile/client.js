import 'svelte/internal/disclose-version';
import Button from './Button.svelte';
import * as $ from 'svelte/internal/client';
import { Story, Template } from '@storybook/addon-svelte-csf';
import { ButtonGroup, ButtonToolbar } from '@sveltestrap/sveltestrap';

export const meta = {
	title: 'Stories/Button',
	component: Button,
	parameters: { controls: { exclude: /^(click|default)$/g } },
	argTypes: {
		class: { control: false, table: { disable: true } },
		content: { control: '' },
		active: { control: 'boolean' },
		block: { control: 'boolean' },
		disabled: { control: 'boolean' },
		close: { control: 'boolean' },
		outline: { control: 'boolean' },
		href: { control: '' },
		value: { control: '' },
		inner: { control: false, table: { disable: true } },
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
				'dark',
				'link'
			]
		},
		size: { control: { type: 'select' }, options: ['sm', 'md', 'lg'] },
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
		active: false,
		block: false,
		content: undefined,
		close: false,
		color: 'secondary',
		disabled: false,
		href: '',
		inner: undefined,
		outline: false,
		size: null,
		value: ''
	}
};

var root = $.from_html(`<div class="horizontal capitalize"></div>`);
var root_1 = $.from_html(`<div class="horizontal"></div>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Button_stories($$anchor, $$props) {
	const colors = [
		'primary',
		'secondary',
		'success',
		'danger',
		'warning',
		'info',
		'light',
		'dark',
		'link'
	];

	const sizesMap = { sm: 'Small', md: 'Medium', lg: 'Large' };
	var fragment = root_4();
	var node = $.first_child(fragment);

	Template(node, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);

				Button($$anchor, $.spread_props(() => $.get(args), {
					$$events: {
						click: function ($$arg) {
							$.bubble_event.call(this, $$props, $$arg);
						}
					}
				}));
			}
		}
	});

	var node_1 = $.sibling(node, 2);

	Story(node_1, {
		name: 'Basic',
		args: { size: 'md', color: 'primary', content: 'Button' }
	});

	var node_2 = $.sibling(node_1, 2);

	Story(node_2, {
		name: 'Colors',
		args: { color: 'primary' },
		children: ($$anchor, $$slotProps) => {
			var div = root();

			$.each(div, 21, () => colors, $.index, ($$anchor, color) => {
				Button($$anchor, {
					class: 'capitalize',
					get color() {
						return $.get(color);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text();

						$.template_effect(() => $.set_text(text, $.get(color)));
						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Story(node_3, {
		name: 'Outlines',
		args: { color: 'primary' },
		children: ($$anchor, $$slotProps) => {
			var div_1 = root_1();

			$.each(div_1, 21, () => colors, $.index, ($$anchor, color) => {
				Button($$anchor, {
					class: 'capitalize',
					outline: true,
					get color() {
						return $.get(color);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text();

						$.template_effect(() => $.set_text(text_1, $.get(color)));
						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div_1);
			$.append($$anchor, div_1);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Story(node_4, {
		name: 'Sizes',
		args: { size: 'md' },
		children: ($$anchor, $$slotProps) => {
			var div_2 = root_1();

			$.each(div_2, 21, () => Object.keys(sizesMap), $.index, ($$anchor, size) => {
				Button($$anchor, {
					get size() {
						return $.get(size);
					},
					color: 'primary',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text();

						$.template_effect(() => $.set_text(text_2, sizesMap[$.get(size)]));
						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div_2);
			$.append($$anchor, div_2);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Story(node_5, {
		name: 'Groups',
		children: ($$anchor, $$slotProps) => {
			ButtonGroup($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_9 = root_2();
					var node_6 = $.first_child(fragment_9);

					Button(node_6, {
						color: 'primary',
						active: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Alpha');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_6, 2);

					Button(node_7, {
						color: 'primary',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Bravo');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_7, 2);

					Button(node_8, {
						color: 'primary',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('Charlie');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_9);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_5, 2);

	Story(node_9, {
		name: 'Toolbar',
		children: ($$anchor, $$slotProps) => {
			ButtonToolbar($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_11 = root_2();
					var node_10 = $.first_child(fragment_11);

					ButtonGroup(node_10, {
						class: 'me-2',
						children: ($$anchor, $$slotProps) => {
							var fragment_12 = root_3();
							var node_11 = $.first_child(fragment_12);

							Button(node_11, {
								color: 'primary',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_6 = $.text('1');

									$.append($$anchor, text_6);
								},
								$$slots: { default: true }
							});

							var node_12 = $.sibling(node_11, 2);

							Button(node_12, {
								color: 'primary',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_7 = $.text('2');

									$.append($$anchor, text_7);
								},
								$$slots: { default: true }
							});

							var node_13 = $.sibling(node_12, 2);

							Button(node_13, {
								color: 'primary',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_8 = $.text('3');

									$.append($$anchor, text_8);
								},
								$$slots: { default: true }
							});

							var node_14 = $.sibling(node_13, 2);

							Button(node_14, {
								color: 'primary',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_9 = $.text('4');

									$.append($$anchor, text_9);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_12);
						},
						$$slots: { default: true }
					});

					var node_15 = $.sibling(node_10, 2);

					ButtonGroup(node_15, {
						class: 'me-2',
						children: ($$anchor, $$slotProps) => {
							var fragment_13 = root_2();
							var node_16 = $.first_child(fragment_13);

							Button(node_16, {
								color: 'primary',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_10 = $.text('5');

									$.append($$anchor, text_10);
								},
								$$slots: { default: true }
							});

							var node_17 = $.sibling(node_16, 2);

							Button(node_17, {
								color: 'primary',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_11 = $.text('6');

									$.append($$anchor, text_11);
								},
								$$slots: { default: true }
							});

							var node_18 = $.sibling(node_17, 2);

							Button(node_18, {
								color: 'primary',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_12 = $.text('7');

									$.append($$anchor, text_12);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_13);
						},
						$$slots: { default: true }
					});

					var node_19 = $.sibling(node_15, 2);

					ButtonGroup(node_19, {
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								color: 'primary',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_13 = $.text('8');

									$.append($$anchor, text_13);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_11);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}