import * as $ from 'svelte/internal/server';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { Button } from '../Button';
import { Group } from '../Group';
import { Image } from '../Image';
import { Text } from '../Text';
import { Menu } from '../Menu';
import { Card } from './index';
import { Camera, ChatBubble, Gear, MagnifyingGlass, Trash, Width } from 'radix-icons-svelte';

export default function Card_stories($$renderer) {
	Meta($$renderer, { title: 'Components/Card', component: Card });
	$$renderer.push(`<!----> `);

	Template($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				Card($$renderer, $.spread_props([
					{ shadow: 'sm', padding: 'lg' },
					args,
					{
						children: ($$renderer) => {
							if (Card.Section) {
								$$renderer.push('<!--[-->');

								Card.Section($$renderer, {
									padding: 'lg',
									children: ($$renderer) => {
										Image($$renderer, {
											src: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3540&q=80',
											height: 160,
											alt: 'Portugal'
										});
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							Group($$renderer, {
								position: 'apart',
								override: { marginBottom: '5px', marginTop: '$smPX' },
								children: ($$renderer) => {
									Text($$renderer, {
										weight: 500,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Portugal Porto Adventures`);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Text($$renderer, {
								size: 'sm',
								override: { lineHeight: 1.5 },
								children: ($$renderer) => {
									$$renderer.push(`<!---->With Portugal Porto Adventures you can explore more of the beautiful portuguese cities, by
			walking on food, meeting the locals and eat excellent food and wine`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								variant: 'light',
								color: 'blue',
								fullSize: true,
								override: { marginTop: '14px' },
								children: ($$renderer) => {
									$$renderer.push(`<!---->Book classic tour now`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					}
				]));
			}
		}
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Card',
		id: 'cardStory',
		args: { withBorder: true, radius: 'md', shadow: 'sm', padding: 'lg' }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'With Menu inside',
		id: 'cardWithMenuStory',
		children: ($$renderer) => {
			Card($$renderer, {
				shadow: 'sm',
				padding: 'lg',
				children: ($$renderer) => {
					Menu($$renderer, {
						override: { root: { position: 'relative' } },
						children: ($$renderer) => {
							if (Menu.Label) {
								$$renderer.push('<!--[-->');

								Menu.Label($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Application`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Menu.Item) {
								$$renderer.push('<!--[-->');

								Menu.Item($$renderer, {
									icon: Gear,
									children: ($$renderer) => {
										$$renderer.push(`<!---->Settings`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Menu.Item) {
								$$renderer.push('<!--[-->');

								Menu.Item($$renderer, {
									icon: ChatBubble,
									children: ($$renderer) => {
										$$renderer.push(`<!---->Messages`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Menu.Item) {
								$$renderer.push('<!--[-->');

								Menu.Item($$renderer, {
									icon: Camera,
									children: ($$renderer) => {
										$$renderer.push(`<!---->Gallery`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}