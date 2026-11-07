import * as $ from 'svelte/internal/server';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { Anchor } from '../Anchor';
import { Stack } from '../Stack';
import { Text } from '../Text';
import { Title } from '../Title';
import { AppShell, Header, Navbar, ShellSection } from './index';

export default function AppShell_stories($$renderer) {
	Meta($$renderer, { title: 'Components/App Shell', component: AppShell });
	$$renderer.push(`<!----> `);

	Template($$renderer, {
		children: ($$renderer) => {
			AppShell($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div style="display: flex;">This is the main content</div>`);
				},

				$$slots: {
					default: true,
					navbar: ($$renderer) => {
						Navbar($$renderer, {
							slot: 'navbar',
							fixed: true,
							width: { sm: 200, lg: 300 },
							children: ($$renderer) => {
								ShellSection($$renderer, {
									grow: true,
									children: ($$renderer) => {
										Stack($$renderer, {
											children: ($$renderer) => {
												Text($$renderer, {
													align: 'center',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Navbar`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												Anchor($$renderer, {
													href: '#',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Home Page`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												Anchor($$renderer, {
													href: '#',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Test Page`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!---->`);
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

					header: ($$renderer) => {
						Header($$renderer, {
							slot: 'header',
							height: 60,
							children: ($$renderer) => {
								Title($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Header`);
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

	$$renderer.push(`<!----> `);
	Story($$renderer, { name: 'App Shell', id: 'appShellStory' });
	$$renderer.push(`<!---->`);
}