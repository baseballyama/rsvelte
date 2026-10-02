import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Center, Divider, Menu, Text } from '@svelteuidev/core';
import { Camera, ChatBubble, Gear, MagnifyingGlass, Trash, Width } from 'radix-icons-svelte';

const code = `
<script>
	import { Divider, Menu, Text } from '@svelteuidev/core';
	import { Camera, ChatBubble, Gear, MagnifyingGlass, Trash, Width } from 'radix-icons-svelte';
<\/script>

<Menu trigger='hover' delay={500}>
    <Menu.Label>Application</Menu.Label>
    <Menu.Item icon={Gear}>Settings</Menu.Item>
    <Menu.Item icon={ChatBubble}>Messages</Menu.Item>
    <Menu.Item icon={Camera}>Gallery</Menu.Item>
    <Menu.Item icon={MagnifyingGlass}>
        <svelte:fragment slot='rightSection'>
            <Text size="xs" color="dimmed">⌘K</Text>
        </svelte:fragment>
        Search
    </Menu.Item>

    <Divider />

    <Menu.Label>Danger zone</Menu.Label>
    <Menu.Item icon={Width}>Transfer my data</Menu.Item>
    <Menu.Item color="red" icon={Trash}>Delete my account</Menu.Item>
</Menu>
`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Menu_demo_hover($$anchor) {
	Center($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Menu($$anchor, {
				trigger: 'hover',
				delay: 500,
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					$.component(node, () => Menu.Label, ($$anchor, Menu_Label) => {
						Menu_Label($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('Application');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});

					var node_1 = $.sibling(node, 2);

					$.component(node_1, () => Menu.Item, ($$anchor, Menu_Item) => {
						Menu_Item($$anchor, {
							get icon() {
								return Gear;
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text('Settings');

								$.append($$anchor, text_1);
							},
							$$slots: { default: true }
						});
					});

					var node_2 = $.sibling(node_1, 2);

					$.component(node_2, () => Menu.Item, ($$anchor, Menu_Item_1) => {
						Menu_Item_1($$anchor, {
							get icon() {
								return ChatBubble;
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_2 = $.text('Messages');

								$.append($$anchor, text_2);
							},
							$$slots: { default: true }
						});
					});

					var node_3 = $.sibling(node_2, 2);

					$.component(node_3, () => Menu.Item, ($$anchor, Menu_Item_2) => {
						Menu_Item_2($$anchor, {
							get icon() {
								return Camera;
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_3 = $.text('Gallery');

								$.append($$anchor, text_3);
							},
							$$slots: { default: true }
						});
					});

					var node_4 = $.sibling(node_3, 2);

					$.component(node_4, () => Menu.Item, ($$anchor, Menu_Item_3) => {
						Menu_Item_3($$anchor, {
							get icon() {
								return MagnifyingGlass;
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_4 = $.text('Search');

								$.append($$anchor, text_4);
							},

							$$slots: {
								default: true,
								rightSection: ($$anchor, $$slotProps) => {
									Text($$anchor, {
										size: 'xs',
										color: 'dimmed',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_5 = $.text('⌘K');

											$.append($$anchor, text_5);
										},
										$$slots: { default: true }
									});
								}
							}
						});
					});

					var node_5 = $.sibling(node_4, 2);

					Divider(node_5, {});

					var node_6 = $.sibling(node_5, 2);

					$.component(node_6, () => Menu.Label, ($$anchor, Menu_Label_1) => {
						Menu_Label_1($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_6 = $.text('Danger zone');

								$.append($$anchor, text_6);
							},
							$$slots: { default: true }
						});
					});

					var node_7 = $.sibling(node_6, 2);

					$.component(node_7, () => Menu.Item, ($$anchor, Menu_Item_4) => {
						Menu_Item_4($$anchor, {
							get icon() {
								return Width;
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_7 = $.text('Transfer my data');

								$.append($$anchor, text_7);
							},
							$$slots: { default: true }
						});
					});

					var node_8 = $.sibling(node_7, 2);

					$.component(node_8, () => Menu.Item, ($$anchor, Menu_Item_5) => {
						Menu_Item_5($$anchor, {
							color: 'red',
							get icon() {
								return Trash;
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_8 = $.text('Delete my account');

								$.append($$anchor, text_8);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}