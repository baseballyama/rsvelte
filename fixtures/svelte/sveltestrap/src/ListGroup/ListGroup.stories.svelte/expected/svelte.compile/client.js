import 'svelte/internal/disclose-version';
import ListGroup from './ListGroup.svelte';
import * as $ from 'svelte/internal/client';
import { Story, Template } from '@storybook/addon-svelte-csf';
import { ListGroupItem } from '@sveltestrap/sveltestrap';

export const meta = {
	title: 'Stories/ListGroup',
	component: ListGroup,
	parameters: { controls: { exclude: /^(default)$/g } },
	argTypes: {
		class: { className: 'string', table: { disable: true } },
		flush: { control: 'boolean' },
		horizontal: { control: 'boolean' },
		numbered: { control: 'boolean' },
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
		flush: false,
		horizontal: false,
		numbered: false,
		theme: null
	}
};

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="listgroup-example"><div class="listgroup-item-size"><!></div></div>`);
var root_2 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<div class="listgroup-example"><div class="listgroup-item-size"><h4 class="text-content">Anchors</h4> <!> <h4 class="mt-3 text-content">Buttons</h4> <!></div></div>`);
var root_4 = $.from_html(`<div class="listgroup-example vertical gap-xxl"><div class="listgroup-item-size"><!></div> <div class="listgroup-item-size"><!></div></div>`);
var root_5 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function ListGroup_stories($$anchor) {
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

	var fragment = root_5();
	var node = $.first_child(fragment);

	Template(node, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);
				var div = root_1();
				var div_1 = $.child(div);
				var node_1 = $.child(div_1);

				ListGroup(node_1, $.spread_props(() => $.get(args), {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_2 = $.first_child(fragment_1);

						ListGroupItem(node_2, {
							active: true,
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('Active');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});

						var node_3 = $.sibling(node_2, 2);

						ListGroupItem(node_3, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text('Bravo');

								$.append($$anchor, text_1);
							},
							$$slots: { default: true }
						});

						var node_4 = $.sibling(node_3, 2);

						ListGroupItem(node_4, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_2 = $.text('Charlie');

								$.append($$anchor, text_2);
							},
							$$slots: { default: true }
						});

						var node_5 = $.sibling(node_4, 2);

						ListGroupItem(node_5, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_3 = $.text('Delta');

								$.append($$anchor, text_3);
							},
							$$slots: { default: true }
						});

						var node_6 = $.sibling(node_5, 2);

						ListGroupItem(node_6, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_4 = $.text('Echo');

								$.append($$anchor, text_4);
							},
							$$slots: { default: true }
						});

						var node_7 = $.sibling(node_6, 2);

						ListGroupItem(node_7, {
							disabled: true,
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_5 = $.text('Disabled');

								$.append($$anchor, text_5);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				}));

				$.reset(div_1);
				$.reset(div);
				$.append($$anchor, div);
			}
		}
	});

	var node_8 = $.sibling(node, 2);

	Story(node_8, { name: 'Basic' });

	var node_9 = $.sibling(node_8, 2);

	Story(node_9, {
		name: 'Colors',
		children: ($$anchor, $$slotProps) => {
			var div_2 = root_1();
			var div_3 = $.child(div_2);
			var node_10 = $.child(div_3);

			ListGroup(node_10, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_11 = $.first_child(fragment_2);

					$.each(node_11, 17, () => colors, $.index, ($$anchor, color) => {
						ListGroupItem($$anchor, {
							get color() {
								return $.get(color);
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_6 = $.text();

								$.template_effect(() => $.set_text(text_6, $.get(color)));
								$.append($$anchor, text_6);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.reset(div_3);
			$.reset(div_2);
			$.append($$anchor, div_2);
		},
		$$slots: { default: true }
	});

	var node_12 = $.sibling(node_9, 2);

	Story(node_12, {
		name: 'Actions',
		children: ($$anchor, $$slotProps) => {
			var div_4 = root_3();
			var div_5 = $.child(div_4);
			var node_13 = $.sibling($.child(div_5), 2);

			ListGroup(node_13, {
				children: ($$anchor, $$slotProps) => {
					var fragment_5 = root_2();
					var node_14 = $.first_child(fragment_5);

					ListGroupItem(node_14, {
						active: true,
						tag: 'a',
						href: 'https://svelte.dev',
						action: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text('Active');

							$.append($$anchor, text_7);
						},
						$$slots: { default: true }
					});

					var node_15 = $.sibling(node_14, 2);

					ListGroupItem(node_15, {
						tag: 'a',
						href: 'https://svelte.dev',
						action: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_8 = $.text('Bravo');

							$.append($$anchor, text_8);
						},
						$$slots: { default: true }
					});

					var node_16 = $.sibling(node_15, 2);

					ListGroupItem(node_16, {
						tag: 'a',
						href: 'https://svelte.dev',
						action: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_9 = $.text('Charlie');

							$.append($$anchor, text_9);
						},
						$$slots: { default: true }
					});

					var node_17 = $.sibling(node_16, 2);

					ListGroupItem(node_17, {
						tag: 'a',
						href: 'https://svelte.dev',
						action: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_10 = $.text('Delta');

							$.append($$anchor, text_10);
						},
						$$slots: { default: true }
					});

					var node_18 = $.sibling(node_17, 2);

					ListGroupItem(node_18, {
						disabled: true,
						tag: 'a',
						href: 'https://svelte.dev',
						action: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_11 = $.text('Disabled');

							$.append($$anchor, text_11);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});

			var node_19 = $.sibling(node_13, 4);

			ListGroup(node_19, {
				children: ($$anchor, $$slotProps) => {
					var fragment_6 = root_2();
					var node_20 = $.first_child(fragment_6);

					ListGroupItem(node_20, {
						active: true,
						tag: 'button',
						action: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_12 = $.text('Active');

							$.append($$anchor, text_12);
						},
						$$slots: { default: true }
					});

					var node_21 = $.sibling(node_20, 2);

					ListGroupItem(node_21, {
						tag: 'button',
						action: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_13 = $.text('Bravo');

							$.append($$anchor, text_13);
						},
						$$slots: { default: true }
					});

					var node_22 = $.sibling(node_21, 2);

					ListGroupItem(node_22, {
						tag: 'button',
						action: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_14 = $.text('Charlie');

							$.append($$anchor, text_14);
						},
						$$slots: { default: true }
					});

					var node_23 = $.sibling(node_22, 2);

					ListGroupItem(node_23, {
						tag: 'button',
						action: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_15 = $.text('Delta');

							$.append($$anchor, text_15);
						},
						$$slots: { default: true }
					});

					var node_24 = $.sibling(node_23, 2);

					ListGroupItem(node_24, {
						disabled: true,
						tag: 'button',
						action: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_16 = $.text('Disabled');

							$.append($$anchor, text_16);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_6);
				},
				$$slots: { default: true }
			});

			$.reset(div_5);
			$.reset(div_4);
			$.append($$anchor, div_4);
		},
		$$slots: { default: true }
	});

	var node_25 = $.sibling(node_12, 2);

	Story(node_25, {
		name: 'Flush',
		children: ($$anchor, $$slotProps) => {
			var div_6 = root_1();
			var div_7 = $.child(div_6);
			var node_26 = $.child(div_7);

			ListGroup(node_26, {
				flush: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_7 = root_2();
					var node_27 = $.first_child(fragment_7);

					ListGroupItem(node_27, {
						disabled: true,
						tag: 'a',
						href: '#',
						active: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_17 = $.text('Active');

							$.append($$anchor, text_17);
						},
						$$slots: { default: true }
					});

					var node_28 = $.sibling(node_27, 2);

					ListGroupItem(node_28, {
						tag: 'a',
						href: '#',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_18 = $.text('Dapibus ac facilisis in');

							$.append($$anchor, text_18);
						},
						$$slots: { default: true }
					});

					var node_29 = $.sibling(node_28, 2);

					ListGroupItem(node_29, {
						tag: 'a',
						href: '#',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_19 = $.text('Morbi leo risus');

							$.append($$anchor, text_19);
						},
						$$slots: { default: true }
					});

					var node_30 = $.sibling(node_29, 2);

					ListGroupItem(node_30, {
						tag: 'a',
						href: '#',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_20 = $.text('Porta ac consectetur ac');

							$.append($$anchor, text_20);
						},
						$$slots: { default: true }
					});

					var node_31 = $.sibling(node_30, 2);

					ListGroupItem(node_31, {
						tag: 'a',
						href: '#',
						disabled: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_21 = $.text('Disabled');

							$.append($$anchor, text_21);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_7);
				},
				$$slots: { default: true }
			});

			$.reset(div_7);
			$.reset(div_6);
			$.append($$anchor, div_6);
		},
		$$slots: { default: true }
	});

	var node_32 = $.sibling(node_25, 2);

	Story(node_32, {
		name: 'Horizontal',
		children: ($$anchor, $$slotProps) => {
			var div_8 = root_1();
			var div_9 = $.child(div_8);
			var node_33 = $.child(div_9);

			ListGroup(node_33, {
				horizontal: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_8 = root();
					var node_34 = $.first_child(fragment_8);

					ListGroupItem(node_34, {
						active: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_22 = $.text('Active');

							$.append($$anchor, text_22);
						},
						$$slots: { default: true }
					});

					var node_35 = $.sibling(node_34, 2);

					ListGroupItem(node_35, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_23 = $.text('Lorem');

							$.append($$anchor, text_23);
						},
						$$slots: { default: true }
					});

					var node_36 = $.sibling(node_35, 2);

					ListGroupItem(node_36, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_24 = $.text('Ipsum');

							$.append($$anchor, text_24);
						},
						$$slots: { default: true }
					});

					var node_37 = $.sibling(node_36, 2);

					ListGroupItem(node_37, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_25 = $.text('Dolor');

							$.append($$anchor, text_25);
						},
						$$slots: { default: true }
					});

					var node_38 = $.sibling(node_37, 2);

					ListGroupItem(node_38, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_26 = $.text('Sit');

							$.append($$anchor, text_26);
						},
						$$slots: { default: true }
					});

					var node_39 = $.sibling(node_38, 2);

					ListGroupItem(node_39, {
						disabled: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_27 = $.text('Amet');

							$.append($$anchor, text_27);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_8);
				},
				$$slots: { default: true }
			});

			$.reset(div_9);
			$.reset(div_8);
			$.append($$anchor, div_8);
		},
		$$slots: { default: true }
	});

	var node_40 = $.sibling(node_32, 2);

	Story(node_40, {
		name: 'Numbered',
		children: ($$anchor, $$slotProps) => {
			var div_10 = root_1();
			var div_11 = $.child(div_10);
			var node_41 = $.child(div_11);

			ListGroup(node_41, {
				numbered: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_9 = root_2();
					var node_42 = $.first_child(fragment_9);

					ListGroupItem(node_42, {
						active: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_28 = $.text('Active');

							$.append($$anchor, text_28);
						},
						$$slots: { default: true }
					});

					var node_43 = $.sibling(node_42, 2);

					ListGroupItem(node_43, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_29 = $.text('Dapibus ac facilisis in');

							$.append($$anchor, text_29);
						},
						$$slots: { default: true }
					});

					var node_44 = $.sibling(node_43, 2);

					ListGroupItem(node_44, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_30 = $.text('Morbi leo risus');

							$.append($$anchor, text_30);
						},
						$$slots: { default: true }
					});

					var node_45 = $.sibling(node_44, 2);

					ListGroupItem(node_45, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_31 = $.text('Porta ac consectetur ac');

							$.append($$anchor, text_31);
						},
						$$slots: { default: true }
					});

					var node_46 = $.sibling(node_45, 2);

					ListGroupItem(node_46, {
						disabled: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_32 = $.text('Disabled');

							$.append($$anchor, text_32);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_9);
				},
				$$slots: { default: true }
			});

			$.reset(div_11);
			$.reset(div_10);
			$.append($$anchor, div_10);
		},
		$$slots: { default: true }
	});

	var node_47 = $.sibling(node_40, 2);

	Story(node_47, {
		name: 'Theming',
		children: ($$anchor, $$slotProps) => {
			var div_12 = root_4();
			var div_13 = $.child(div_12);
			var node_48 = $.child(div_13);

			ListGroup(node_48, {
				theme: 'dark',
				children: ($$anchor, $$slotProps) => {
					var fragment_10 = root();
					var node_49 = $.first_child(fragment_10);

					ListGroupItem(node_49, {
						active: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_33 = $.text('Active');

							$.append($$anchor, text_33);
						},
						$$slots: { default: true }
					});

					var node_50 = $.sibling(node_49, 2);

					ListGroupItem(node_50, {
						color: 'primary',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_34 = $.text('Bravo');

							$.append($$anchor, text_34);
						},
						$$slots: { default: true }
					});

					var node_51 = $.sibling(node_50, 2);

					ListGroupItem(node_51, {
						color: 'success',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_35 = $.text('Charlie');

							$.append($$anchor, text_35);
						},
						$$slots: { default: true }
					});

					var node_52 = $.sibling(node_51, 2);

					ListGroupItem(node_52, {
						color: 'warning',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_36 = $.text('Delta');

							$.append($$anchor, text_36);
						},
						$$slots: { default: true }
					});

					var node_53 = $.sibling(node_52, 2);

					ListGroupItem(node_53, {
						color: 'danger',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_37 = $.text('Echo');

							$.append($$anchor, text_37);
						},
						$$slots: { default: true }
					});

					var node_54 = $.sibling(node_53, 2);

					ListGroupItem(node_54, {
						disabled: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_38 = $.text('Disabled');

							$.append($$anchor, text_38);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_10);
				},
				$$slots: { default: true }
			});

			$.reset(div_13);

			var div_14 = $.sibling(div_13, 2);
			var node_55 = $.child(div_14);

			ListGroup(node_55, {
				theme: 'light',
				children: ($$anchor, $$slotProps) => {
					var fragment_11 = root();
					var node_56 = $.first_child(fragment_11);

					ListGroupItem(node_56, {
						active: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_39 = $.text('Active');

							$.append($$anchor, text_39);
						},
						$$slots: { default: true }
					});

					var node_57 = $.sibling(node_56, 2);

					ListGroupItem(node_57, {
						color: 'primary',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_40 = $.text('Bravo');

							$.append($$anchor, text_40);
						},
						$$slots: { default: true }
					});

					var node_58 = $.sibling(node_57, 2);

					ListGroupItem(node_58, {
						color: 'success',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_41 = $.text('Charlie');

							$.append($$anchor, text_41);
						},
						$$slots: { default: true }
					});

					var node_59 = $.sibling(node_58, 2);

					ListGroupItem(node_59, {
						color: 'warning',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_42 = $.text('Delta');

							$.append($$anchor, text_42);
						},
						$$slots: { default: true }
					});

					var node_60 = $.sibling(node_59, 2);

					ListGroupItem(node_60, {
						color: 'danger',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_43 = $.text('Echo');

							$.append($$anchor, text_43);
						},
						$$slots: { default: true }
					});

					var node_61 = $.sibling(node_60, 2);

					ListGroupItem(node_61, {
						disabled: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_44 = $.text('Disabled');

							$.append($$anchor, text_44);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_11);
				},
				$$slots: { default: true }
			});

			$.reset(div_14);
			$.reset(div_12);
			$.append($$anchor, div_12);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}