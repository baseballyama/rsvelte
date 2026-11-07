import 'svelte/internal/disclose-version';
import Badge from './Badge.svelte';
import * as $ from 'svelte/internal/client';
import { Story, Template } from '@storybook/addon-svelte-csf';
import { Button } from '@sveltestrap/sveltestrap';

export const meta = {
	title: 'Stories/Badges',
	component: Badge,
	parameters: { controls: { exclude: /^(default)$/g } },
	argTypes: {
		ariaLabel: { control: '' },
		border: {
			control: { type: 'select' },
			options: [
				'',
				'border',
				'border-top',
				'border-end',
				'border-bottom',
				'border-start'
			]
		},
		class: { control: false, table: { disable: true } },
		content: { control: '' },
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
		href: { control: '' },
		indicator: { control: 'boolean' },
		pill: { control: 'boolean' },
		positioned: { control: 'boolean' },
		placement: { control: '' },
		shadow: {
			control: { type: 'select' },
			options: ['', 'shadow-none', 'shadow-sm', 'shadow', 'shadow-lg']
		},
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
		ariaLabel: '',
		border: false,
		class: '',
		content: '',
		color: 'primary',
		href: '',
		indicator: false,
		pill: false,
		placement: 'top-0 start-100',
		positioned: false,
		shadow: false,
		theme: null
	}
};

var root = $.from_html(`<div class="horizontal"></div>`);
var root_1 = $.from_html(`Notifications <!>`, 1);
var root_2 = $.from_html(`<div class="horizontal"><!> <!></div>`);
var root_3 = $.from_html(`Inbox <!>`, 1);
var root_4 = $.from_html(`Profile <!>`, 1);
var root_5 = $.from_html(`<div class="mb-3"><!></div> <div><!></div>`, 1);
var root_6 = $.from_html(`<div class="headings-example"><h1>Example heading <!></h1> <h2>Example heading <!></h2> <h3>Example heading <!></h3> <h4>Example heading <!></h4> <h5>Example heading <!></h5> <h6>Example heading <!></h6></div>`);
var root_7 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Badge_stories($$anchor) {
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

	const basicSource = `
   <Badge color="primary">Badge</Badge>
  `;

	var fragment = root_7();
	var node = $.first_child(fragment);

	Template(node, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);

				Badge($$anchor, $.spread_props(() => $.get(args)));
			}
		}
	});

	var node_1 = $.sibling(node, 2);

	Story(node_1, {
		name: 'Basic',
		args: { color: 'primary', content: 'Badge' },
		source: basicSource
	});

	var node_2 = $.sibling(node_1, 2);

	Story(node_2, {
		name: 'Colors',
		children: ($$anchor, $$slotProps) => {
			var div = root();

			$.each(div, 21, () => colors, $.index, ($$anchor, color) => {
				Badge($$anchor, {
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
		name: 'Buttons',
		children: ($$anchor, $$slotProps) => {
			var div_1 = root_2();
			var node_4 = $.child(div_1);

			Button(node_4, {
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_4 = root_1();
					var node_5 = $.sibling($.first_child(fragment_4));

					Badge(node_5, {
						color: 'dark',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('4');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_4, 2);

			Button(node_6, {
				color: 'primary',
				outline: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_5 = root_1();
					var node_7 = $.sibling($.first_child(fragment_5));

					Badge(node_7, {
						color: 'primary',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('7');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});

			$.reset(div_1);
			$.append($$anchor, div_1);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_3, 2);

	Story(node_8, {
		name: 'Positioned',
		children: ($$anchor, $$slotProps) => {
			var fragment_6 = root_5();
			var div_2 = $.first_child(fragment_6);
			var node_9 = $.child(div_2);

			Button(node_9, {
				color: 'primary',
				class: 'position-relative',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_7 = root_3();
					var node_10 = $.sibling($.first_child(fragment_7));

					Badge(node_10, {
						color: 'danger',
						pill: true,
						positioned: true,
						ariaLabel: 'Unread messages',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('100+');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_7);
				},
				$$slots: { default: true }
			});

			$.reset(div_2);

			var div_3 = $.sibling(div_2, 2);
			var node_11 = $.child(div_3);

			Button(node_11, {
				color: 'primary',
				class: 'position-relative',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_8 = root_4();
					var node_12 = $.sibling($.first_child(fragment_8));

					Badge(node_12, {
						color: 'danger',
						pill: true,
						indicator: true,
						border: true,
						positioned: true,
						ariaLabel: 'New alerts'
					});

					$.append($$anchor, fragment_8);
				},
				$$slots: { default: true }
			});

			$.reset(div_3);
			$.append($$anchor, fragment_6);
		},
		$$slots: { default: true }
	});

	var node_13 = $.sibling(node_8, 2);

	Story(node_13, {
		name: 'Pills',
		children: ($$anchor, $$slotProps) => {
			var div_4 = root();

			$.each(div_4, 21, () => colors, $.index, ($$anchor, color) => {
				Badge($$anchor, {
					pill: true,
					get color() {
						return $.get(color);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text();

						$.template_effect(() => $.set_text(text_4, $.get(color)));
						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div_4);
			$.append($$anchor, div_4);
		},
		$$slots: { default: true }
	});

	var node_14 = $.sibling(node_13, 2);

	Story(node_14, {
		name: 'Links',
		children: ($$anchor, $$slotProps) => {
			Badge($$anchor, {
				href: 'https://svelte.dev',
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('Link Badge');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_15 = $.sibling(node_14, 2);

	Story(node_15, {
		name: 'Headings',
		children: ($$anchor, $$slotProps) => {
			var div_5 = root_6();
			var h1 = $.child(div_5);
			var node_16 = $.sibling($.child(h1));

			Badge(node_16, {
				color: 'secondary',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_6 = $.text('New');

					$.append($$anchor, text_6);
				},
				$$slots: { default: true }
			});

			$.reset(h1);

			var h2 = $.sibling(h1, 2);
			var node_17 = $.sibling($.child(h2));

			Badge(node_17, {
				color: 'secondary',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_7 = $.text('New');

					$.append($$anchor, text_7);
				},
				$$slots: { default: true }
			});

			$.reset(h2);

			var h3 = $.sibling(h2, 2);
			var node_18 = $.sibling($.child(h3));

			Badge(node_18, {
				color: 'secondary',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_8 = $.text('New');

					$.append($$anchor, text_8);
				},
				$$slots: { default: true }
			});

			$.reset(h3);

			var h4 = $.sibling(h3, 2);
			var node_19 = $.sibling($.child(h4));

			Badge(node_19, {
				color: 'secondary',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_9 = $.text('New');

					$.append($$anchor, text_9);
				},
				$$slots: { default: true }
			});

			$.reset(h4);

			var h5 = $.sibling(h4, 2);
			var node_20 = $.sibling($.child(h5));

			Badge(node_20, {
				color: 'secondary',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_10 = $.text('New');

					$.append($$anchor, text_10);
				},
				$$slots: { default: true }
			});

			$.reset(h5);

			var h6 = $.sibling(h5, 2);
			var node_21 = $.sibling($.child(h6));

			Badge(node_21, {
				color: 'secondary',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_11 = $.text('New');

					$.append($$anchor, text_11);
				},
				$$slots: { default: true }
			});

			$.reset(h6);
			$.reset(div_5);
			$.append($$anchor, div_5);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}