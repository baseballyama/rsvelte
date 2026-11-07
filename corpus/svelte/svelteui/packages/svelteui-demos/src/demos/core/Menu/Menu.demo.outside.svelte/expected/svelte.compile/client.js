import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Center, Menu } from '@svelteuidev/core';
import { Camera, ChatBubble, Gear } from 'radix-icons-svelte';

const code = `
<script>
  import { Button, Menu, type MenuComponent } from '@svelteuidev/core';
  import { Camera, ChatBubble, Gear } from 'radix-icons-svelte';

  let element;
<\/script>

<Button on:click={() => element.toggle()}>Toggle Menu</Button>

<Menu bind:this={element}>
  <div slot="control"></div>
  <Menu.Item icon={Gear}>Settings</Menu.Item>
  <Menu.Item icon={ChatBubble}>Messages</Menu.Item>
  <Menu.Item icon={Camera}>Gallery</Menu.Item>
</Menu>
`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Menu_demo_outside($$anchor) {
	let element;

	Center($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			Button(node, {
				$$events: { click: () => element.toggle() },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Toggle Menu');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			$.bind_this(
				Menu(node_1, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => Menu.Item, ($$anchor, Menu_Item) => {
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

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => Menu.Item, ($$anchor, Menu_Item_1) => {
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

						var node_4 = $.sibling(node_3, 2);

						$.component(node_4, () => Menu.Item, ($$anchor, Menu_Item_2) => {
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

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				}),
				($$value) => element = $$value,
				() => element
			);

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}