import * as $ from 'svelte/internal/server';
import { Center, Menu } from '@svelteuidev/core';
import { ExternalLink } from 'radix-icons-svelte';

const code = `
<script>
	import { Menu } from '@svelteuidev/core';
	import { ExternalLink } from 'radix-icons-svelte';
<\/script>

<Menu>
    <Menu.Item root='a' href='https://svelteui.dev'>SvelteUI Website</Menu.Item>
    <Menu.Item
        icon={ExternalLink}
        root='a'
        href='https://svelteui.dev'
        target='_blank'
    >
        External Link
    </Menu.Item>
</Menu>
`;

export const type = 'demo';
export const configuration = { code };

export default function Menu_demo_custom($$renderer) {
	Center($$renderer, {
		children: ($$renderer) => {
			Menu($$renderer, {
				children: ($$renderer) => {
					if (Menu.Item) {
						$$renderer.push('<!--[-->');

						Menu.Item($$renderer, {
							root: 'a',
							href: 'https://svelteui.dev',
							children: ($$renderer) => {
								$$renderer.push(`<!---->SvelteUI Website`);
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
							icon: ExternalLink,
							root: 'a',
							href: 'https://svelteui.dev',
							target: '_blank',
							children: ($$renderer) => {
								$$renderer.push(`<!---->External Link`);
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