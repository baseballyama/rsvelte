import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { LockClosed } from 'radix-icons-svelte';
import { useSvelteUITheme } from '$lib/styles';
import { Group } from '../Group';
import { Button } from './index';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<div style="padding:40px;"></div>`);
var root_3 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Button_stories($$anchor, $$props) {
	$.push($$props, true);

	const theme = useSvelteUITheme();
	const colors = Object.keys(theme.colorNames);
	var fragment = root_3();
	var node = $.first_child(fragment);

	Meta(node, {
		title: 'Components/Button',
		get component() {
			return Button;
		}
	});

	var node_1 = $.sibling(node, 2);

	Template(node_1, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);

				Button($$anchor, $.spread_props(() => $.get(args)));
			}
		}
	});

	var node_2 = $.sibling(node_1, 2);

	Template(node_2, {
		id: 'variants',
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);

				Group($$anchor, {
					mt: 'xl',
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root();
						var node_3 = $.first_child(fragment_3);

						Button(node_3, $.spread_props(() => $.get(args), {
							variant: 'filled',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('Filled button');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						}));

						var node_4 = $.sibling(node_3, 2);

						Button(node_4, $.spread_props(() => $.get(args), {
							variant: 'light',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text('Light button');

								$.append($$anchor, text_1);
							},
							$$slots: { default: true }
						}));

						var node_5 = $.sibling(node_4, 2);

						Button(node_5, $.spread_props(() => $.get(args), {
							variant: 'outline',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_2 = $.text('Outline button');

								$.append($$anchor, text_2);
							},
							$$slots: { default: true }
						}));

						var node_6 = $.sibling(node_5, 2);

						Button(node_6, $.spread_props(() => $.get(args), {
							variant: 'default',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_3 = $.text('Default button');

								$.append($$anchor, text_3);
							},
							$$slots: { default: true }
						}));

						var node_7 = $.sibling(node_6, 2);

						Button(node_7, $.spread_props(() => $.get(args), {
							variant: 'white',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_4 = $.text('White button');

								$.append($$anchor, text_4);
							},
							$$slots: { default: true }
						}));

						var node_8 = $.sibling(node_7, 2);

						Button(node_8, $.spread_props(() => $.get(args), {
							variant: 'gradient',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_5 = $.text('Gradient button');

								$.append($$anchor, text_5);
							},
							$$slots: { default: true }
						}));

						var node_9 = $.sibling(node_8, 2);

						Button(node_9, $.spread_props(() => $.get(args), {
							variant: 'subtle',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_6 = $.text('Subtle button');

								$.append($$anchor, text_6);
							},
							$$slots: { default: true }
						}));

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			}
		}
	});

	var node_10 = $.sibling(node_2, 2);

	Story(node_10, { name: 'Button', id: 'buttonStory' });

	var node_11 = $.sibling(node_10, 2);

	Story(node_11, {
		name: 'Colors',
		id: 'buttonColorsStory',
		children: ($$anchor, $$slotProps) => {
			var div = root_2();

			$.each(div, 21, () => colors, $.index, ($$anchor, color) => {
				Group($$anchor, {
					mt: 'xl',
					children: ($$anchor, $$slotProps) => {
						var fragment_5 = root_1();
						var node_12 = $.first_child(fragment_5);

						Button(node_12, {
							get color() {
								return $.get(color);
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_7 = $.text('Filled button');

								$.append($$anchor, text_7);
							},
							$$slots: { default: true }
						});

						var node_13 = $.sibling(node_12, 2);

						Button(node_13, {
							get color() {
								return $.get(color);
							},
							variant: 'light',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_8 = $.text('Light button');

								$.append($$anchor, text_8);
							},
							$$slots: { default: true }
						});

						var node_14 = $.sibling(node_13, 2);

						Button(node_14, {
							get color() {
								return $.get(color);
							},
							variant: 'outline',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_9 = $.text('Outline button');

								$.append($$anchor, text_9);
							},
							$$slots: { default: true }
						});

						var node_15 = $.sibling(node_14, 2);

						Button(node_15, {
							get color() {
								return $.get(color);
							},
							variant: 'gradient',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_10 = $.text('Gradient button');

								$.append($$anchor, text_10);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_5);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	var node_16 = $.sibling(node_11, 2);

	Story(node_16, {
		name: 'With icon',
		id: 'buttonIconStory',
		children: ($$anchor, $$slotProps) => {
			Button($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_11 = $.text('Sign Up');

					$.append($$anchor, text_11);
				},

				$$slots: {
					default: true,
					leftIcon: ($$anchor, $$slotProps) => {
						LockClosed($$anchor, { slot: 'leftIcon' });
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_17 = $.sibling(node_16, 2);

	Story(node_17, {
		name: 'Disabled',
		id: 'buttonDisabledStory',
		template: 'variants',
		args: { disabled: true }
	});

	var node_18 = $.sibling(node_17, 2);

	Story(node_18, {
		name: 'Loading',
		id: 'buttonLoadingStory',
		template: 'variants',
		args: { loading: true }
	});

	var node_19 = $.sibling(node_18, 2);

	Story(node_19, {
		name: 'With href',
		id: 'buttonHrefStory',
		template: 'variants',
		args: {
			href: 'https://www.svelteui.dev',
			external: true,
			disabled: false,
			loading: false
		}
	});

	$.append($$anchor, fragment);
	$.pop();
}