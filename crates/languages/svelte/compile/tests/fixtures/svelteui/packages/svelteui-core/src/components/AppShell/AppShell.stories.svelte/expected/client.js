import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { Anchor } from '../Anchor';
import { Stack } from '../Stack';
import { Text } from '../Text';
import { Title } from '../Title';
import { AppShell, Header, Navbar, ShellSection } from './index';

var root = $.from_html(`<div style="display: flex;">This is the main content</div>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function AppShell_stories($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	Meta(node, {
		title: 'Components/App Shell',
		get component() {
			return AppShell;
		}
	});

	var node_1 = $.sibling(node, 2);

	Template(node_1, {
		children: ($$anchor, $$slotProps) => {
			AppShell($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var div = root();

					$.append($$anchor, div);
				},

				$$slots: {
					default: true,
					navbar: ($$anchor, $$slotProps) => {
						Navbar($$anchor, {
							slot: 'navbar',
							fixed: true,
							width: { sm: 200, lg: 300 },
							children: ($$anchor, $$slotProps) => {
								ShellSection($$anchor, {
									grow: true,
									children: ($$anchor, $$slotProps) => {
										Stack($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root_1();
												var node_2 = $.first_child(fragment_5);

												Text(node_2, {
													align: 'center',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text = $.text('Navbar');

														$.append($$anchor, text);
													},
													$$slots: { default: true }
												});

												var node_3 = $.sibling(node_2, 2);

												Anchor(node_3, {
													href: '#',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_1 = $.text('Home Page');

														$.append($$anchor, text_1);
													},
													$$slots: { default: true }
												});

												var node_4 = $.sibling(node_3, 2);

												Anchor(node_4, {
													href: '#',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_2 = $.text('Test Page');

														$.append($$anchor, text_2);
													},
													$$slots: { default: true }
												});

												$.append($$anchor, fragment_5);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});
					},

					header: ($$anchor, $$slotProps) => {
						Header($$anchor, {
							slot: 'header',
							height: 60,
							children: ($$anchor, $$slotProps) => {
								Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text('Header');

										$.append($$anchor, text_3);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_1, 2);

	Story(node_5, { name: 'App Shell', id: 'appShellStory' });
	$.append($$anchor, fragment);
}