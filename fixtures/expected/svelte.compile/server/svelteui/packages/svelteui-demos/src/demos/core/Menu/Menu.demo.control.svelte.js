import * as $ from 'svelte/internal/server';
import { Button, Center, Menu } from '@svelteuidev/core';
import { Camera, ChatBubble, Gear } from 'radix-icons-svelte';

const code = `
<script>
	import { Button, Divider, Menu } from '@svelteuidev/core';
	import { Camera, ChatBubble, Gear } from 'radix-icons-svelte';
<\/script>

<Menu>
    <Button slot="control">Toggle Menu</Button>
    <Menu.Item icon={Gear}>Settings</Menu.Item>
    <Menu.Item icon={ChatBubble}>Messages</Menu.Item>
    <Menu.Item icon={Camera}>Gallery</Menu.Item>
</Menu>
`;

export const type = 'demo';
export const configuration = { code };

export default function Menu_demo_control($$renderer) {
	Center($$renderer, {
		children: ($$renderer) => {
			Menu($$renderer, {
				children: ($$renderer) => {
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

				$$slots: {
					default: true,
					control: ($$renderer) => {
						Button($$renderer, {
							slot: 'control',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Toggle Menu`);
							},
							$$slots: { default: true }
						});
					}
				}
			});
		},
		$$slots: { default: true }
	});
}