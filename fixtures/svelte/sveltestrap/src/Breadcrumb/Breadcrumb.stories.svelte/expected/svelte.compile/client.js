import 'svelte/internal/disclose-version';
import Breadcrumb from './Breadcrumb.svelte';
import * as $ from 'svelte/internal/client';
import { Story } from '@storybook/addon-svelte-csf';
import { BreadcrumbItem } from '@sveltestrap/sveltestrap';

export const meta = {
	title: 'Stories/Breadcrumbs',
	component: Breadcrumb,
	parameters: { controls: { exclude: /^(default)$/g } },
	argTypes: {
		class: { control: false, table: { disable: true } },
		content: { control: '' },
		divider: { control: '' },
		listClassName: { control: '' },
		style: { control: '' },
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
		content: '',
		divider: '/',
		listClassName: '',
		style: ''
	}
};

var root = $.from_html(`<a href="#home">Home</a>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<a href="#library">Library</a>`);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<div class="breadcrumbs-example"><!> <!> <!></div>`);
var root_5 = $.from_html(`<div class="breadcrumbs-example"><!> <!></div>`);

export default function Breadcrumb_stories($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	Story(node, {
		name: 'Basic',
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);
				var div = root_4();
				var node_1 = $.child(div);

				Breadcrumb(node_1, $.spread_props(() => $.get(args), {
					children: ($$anchor, $$slotProps) => {
						BreadcrumbItem($$anchor, {
							active: true,
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('Home');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				}));

				var node_2 = $.sibling(node_1, 2);

				Breadcrumb(node_2, $.spread_props(() => $.get(args), {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();
						var node_3 = $.first_child(fragment_2);

						BreadcrumbItem(node_3, {
							children: ($$anchor, $$slotProps) => {
								var a = root();

								$.append($$anchor, a);
							},
							$$slots: { default: true }
						});

						var node_4 = $.sibling(node_3, 2);

						BreadcrumbItem(node_4, {
							active: true,
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text('Library');

								$.append($$anchor, text_1);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				}));

				var node_5 = $.sibling(node_2, 2);

				Breadcrumb(node_5, $.spread_props(() => $.get(args), {
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root_3();
						var node_6 = $.first_child(fragment_3);

						BreadcrumbItem(node_6, {
							children: ($$anchor, $$slotProps) => {
								var a_1 = root();

								$.append($$anchor, a_1);
							},
							$$slots: { default: true }
						});

						var node_7 = $.sibling(node_6, 2);

						BreadcrumbItem(node_7, {
							children: ($$anchor, $$slotProps) => {
								var a_2 = root_2();

								$.append($$anchor, a_2);
							},
							$$slots: { default: true }
						});

						var node_8 = $.sibling(node_7, 2);

						BreadcrumbItem(node_8, {
							active: true,
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_2 = $.text('Data');

								$.append($$anchor, text_2);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				}));

				$.reset(div);
				$.append($$anchor, div);
			}
		}
	});

	var node_9 = $.sibling(node, 2);

	Story(node_9, {
		name: 'Divider',
		children: ($$anchor, $$slotProps) => {
			var div_1 = root_5();
			var node_10 = $.child(div_1);

			Breadcrumb(node_10, {
				divider: '・',
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_3();
					var node_11 = $.first_child(fragment_4);

					BreadcrumbItem(node_11, {
						children: ($$anchor, $$slotProps) => {
							var a_3 = root();

							$.append($$anchor, a_3);
						},
						$$slots: { default: true }
					});

					var node_12 = $.sibling(node_11, 2);

					BreadcrumbItem(node_12, {
						children: ($$anchor, $$slotProps) => {
							var a_4 = root_2();

							$.append($$anchor, a_4);
						},
						$$slots: { default: true }
					});

					var node_13 = $.sibling(node_12, 2);

					BreadcrumbItem(node_13, {
						active: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Data');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			var node_14 = $.sibling(node_10, 2);

			Breadcrumb(node_14, {
				divider: '⟫',
				children: ($$anchor, $$slotProps) => {
					var fragment_5 = root_3();
					var node_15 = $.first_child(fragment_5);

					BreadcrumbItem(node_15, {
						children: ($$anchor, $$slotProps) => {
							var a_5 = root();

							$.append($$anchor, a_5);
						},
						$$slots: { default: true }
					});

					var node_16 = $.sibling(node_15, 2);

					BreadcrumbItem(node_16, {
						children: ($$anchor, $$slotProps) => {
							var a_6 = root_2();

							$.append($$anchor, a_6);
						},
						$$slots: { default: true }
					});

					var node_17 = $.sibling(node_16, 2);

					BreadcrumbItem(node_17, {
						active: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Data');

							$.append($$anchor, text_4);
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

	$.append($$anchor, fragment);
}