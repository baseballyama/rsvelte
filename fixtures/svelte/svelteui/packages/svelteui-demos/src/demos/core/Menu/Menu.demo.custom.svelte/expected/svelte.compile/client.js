import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!>`, 1);

export default function Menu_demo_custom($$anchor) {
	Center($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Menu($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					$.component(node, () => Menu.Item, ($$anchor, Menu_Item) => {
						Menu_Item($$anchor, {
							root: 'a',
							href: 'https://svelteui.dev',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('SvelteUI Website');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});

					var node_1 = $.sibling(node, 2);

					$.component(node_1, () => Menu.Item, ($$anchor, Menu_Item_1) => {
						Menu_Item_1($$anchor, {
							get icon() {
								return ExternalLink;
							},
							root: 'a',
							href: 'https://svelteui.dev',
							target: '_blank',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text('External Link');

								$.append($$anchor, text_1);
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