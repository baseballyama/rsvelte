import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { Button } from '../Button';
import { Group } from '../Group';
import { Image } from '../Image';
import { Text } from '../Text';
import { Menu } from '../Menu';
import { Card } from './index';
import { Camera, ChatBubble, Gear, MagnifyingGlass, Trash, Width } from 'radix-icons-svelte';

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Card_stories($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Meta(node, {
		title: 'Components/Card',
		get component() {
			return Card;
		}
	});

	var node_1 = $.sibling(node, 2);

	Template(node_1, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);

				Card($$anchor, $.spread_props({ shadow: 'sm', padding: 'lg' }, () => $.get(args), {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => Card.Section, ($$anchor, Card_Section) => {
							Card_Section($$anchor, {
								padding: 'lg',
								children: ($$anchor, $$slotProps) => {
									Image($$anchor, {
										src: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3540&q=80',
										height: 160,
										alt: 'Portugal'
									});
								},
								$$slots: { default: true }
							});
						});

						var node_3 = $.sibling(node_2, 2);

						Group(node_3, {
							position: 'apart',
							override: { marginBottom: '5px', marginTop: '$smPX' },
							children: ($$anchor, $$slotProps) => {
								Text($$anchor, {
									weight: 500,
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Portugal Porto Adventures');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						var node_4 = $.sibling(node_3, 2);

						Text(node_4, {
							size: 'sm',
							override: { lineHeight: 1.5 },
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text('With Portugal Porto Adventures you can explore more of the beautiful portuguese cities, by\n			walking on food, meeting the locals and eat excellent food and wine');

								$.append($$anchor, text_1);
							},
							$$slots: { default: true }
						});

						var node_5 = $.sibling(node_4, 2);

						Button(node_5, {
							variant: 'light',
							color: 'blue',
							fullSize: true,
							override: { marginTop: '14px' },
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_2 = $.text('Book classic tour now');

								$.append($$anchor, text_2);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				}));
			}
		}
	});

	var node_6 = $.sibling(node_1, 2);

	Story(node_6, {
		name: 'Card',
		id: 'cardStory',
		args: { withBorder: true, radius: 'md', shadow: 'sm', padding: 'lg' }
	});

	var node_7 = $.sibling(node_6, 2);

	Story(node_7, {
		name: 'With Menu inside',
		id: 'cardWithMenuStory',
		children: ($$anchor, $$slotProps) => {
			Card($$anchor, {
				shadow: 'sm',
				padding: 'lg',
				children: ($$anchor, $$slotProps) => {
					Menu($$anchor, {
						override: { root: { position: 'relative' } },
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = root();
							var node_8 = $.first_child(fragment_7);

							$.component(node_8, () => Menu.Label, ($$anchor, Menu_Label) => {
								Menu_Label($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text('Application');

										$.append($$anchor, text_3);
									},
									$$slots: { default: true }
								});
							});

							var node_9 = $.sibling(node_8, 2);

							$.component(node_9, () => Menu.Item, ($$anchor, Menu_Item) => {
								Menu_Item($$anchor, {
									get icon() {
										return Gear;
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_4 = $.text('Settings');

										$.append($$anchor, text_4);
									},
									$$slots: { default: true }
								});
							});

							var node_10 = $.sibling(node_9, 2);

							$.component(node_10, () => Menu.Item, ($$anchor, Menu_Item_1) => {
								Menu_Item_1($$anchor, {
									get icon() {
										return ChatBubble;
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_5 = $.text('Messages');

										$.append($$anchor, text_5);
									},
									$$slots: { default: true }
								});
							});

							var node_11 = $.sibling(node_10, 2);

							$.component(node_11, () => Menu.Item, ($$anchor, Menu_Item_2) => {
								Menu_Item_2($$anchor, {
									get icon() {
										return Camera;
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_6 = $.text('Gallery');

										$.append($$anchor, text_6);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_7);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}