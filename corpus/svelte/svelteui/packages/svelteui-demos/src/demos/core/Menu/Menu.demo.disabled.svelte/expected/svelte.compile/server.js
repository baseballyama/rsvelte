import * as $ from 'svelte/internal/server';
import { Center, Divider, Menu, Text } from '@svelteuidev/core';
import { Camera, ChatBubble, Gear, MagnifyingGlass, Trash, Width } from 'radix-icons-svelte';

const code = `
<script>
	import { Divider, Menu, Text } from '@svelteuidev/core';
	import { Camera, ChatBubble, Gear, MagnifyingGlass, Trash, Width } from 'radix-icons-svelte';
<\/script>

<Menu>
    <Menu.Label>Application</Menu.Label>
    <Menu.Item icon={Gear}>Settings</Menu.Item>
    <Menu.Item icon={ChatBubble}>Messages</Menu.Item>
    <Menu.Item icon={Camera}>Gallery</Menu.Item>
    <Menu.Item icon={MagnifyingGlass} disabled>
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

export default function Menu_demo_disabled($$renderer) {
	Center($$renderer, {
		children: ($$renderer) => {
			Menu($$renderer, {
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

					$$renderer.push(` `);

					if (Menu.Item) {
						$$renderer.push('<!--[-->');

						Menu.Item($$renderer, {
							icon: MagnifyingGlass,
							disabled: true,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Search`);
							},

							$$slots: {
								default: true,
								rightSection: ($$renderer) => {
									{
										Text($$renderer, {
											size: 'xs',
											color: 'dimmed',
											children: ($$renderer) => {
												$$renderer.push(`<!---->⌘K`);
											},
											$$slots: { default: true }
										});
									}
								}
							}
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);
					Divider($$renderer, {});
					$$renderer.push(`<!----> `);

					if (Menu.Label) {
						$$renderer.push('<!--[-->');

						Menu.Label($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Danger zone`);
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
							icon: Width,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Transfer my data`);
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
							color: 'red',
							icon: Trash,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Delete my account`);
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
}