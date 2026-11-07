import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Breadcrumbs, IconRenderer, Space } from '@svelteuidev/core';
import { Home, Person } from 'radix-icons-svelte';

const code = `
<script>
    import { Breadcrumbs, IconRenderer } from '@svelteuidev/core';
    import { Home, Person } from 'radix-icons-svelte';
<\/script>

<Breadcrumbs size="md">
  <Breadcrumbs.Item href="https://svelteui.dev">
    <IconRenderer slot="icon" icon={Home} />
  </Breadcrumbs.Item>
  <Breadcrumbs.Item>
    <IconRenderer slot="icon" icon={Person} />
    Application List
  </Breadcrumbs.Item>
  <Breadcrumbs.Item active={true}>View</Breadcrumbs.Item>
</Breadcrumbs>

<Breadcrumbs size="md" separator="→">
	<Breadcrumbs.Item href="https://svelteui.dev">Home</Breadcrumbs.Item>
	<Breadcrumbs.Item active={true}>Application List</Breadcrumbs.Item>
</Breadcrumbs>
	`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Breadcrumbs_demo_usage($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Breadcrumbs(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => Breadcrumbs.Item, ($$anchor, Breadcrumbs_Item) => {
				Breadcrumbs_Item($$anchor, {
					href: 'https://svelteui.dev',
					$$slots: {
						icon: ($$anchor, $$slotProps) => {
							IconRenderer($$anchor, {
								slot: 'icon',
								get icon() {
									return Home;
								}
							});
						}
					}
				});
			});

			var node_2 = $.sibling(node_1, 2);

			$.component(node_2, () => Breadcrumbs.Item, ($$anchor, Breadcrumbs_Item_1) => {
				Breadcrumbs_Item_1($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Application List');

						$.append($$anchor, text);
					},

					$$slots: {
						default: true,
						icon: ($$anchor, $$slotProps) => {
							IconRenderer($$anchor, {
								slot: 'icon',
								get icon() {
									return Person;
								}
							});
						}
					}
				});
			});

			var node_3 = $.sibling(node_2, 2);

			$.component(node_3, () => Breadcrumbs.Item, ($$anchor, Breadcrumbs_Item_2) => {
				Breadcrumbs_Item_2($$anchor, {
					active: true,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('View');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node, 2);

	Space(node_4, { h: 10 });

	var node_5 = $.sibling(node_4, 2);

	Breadcrumbs(node_5, {
		size: 'lg',
		separator: '→',
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root_1();
			var node_6 = $.first_child(fragment_4);

			$.component(node_6, () => Breadcrumbs.Item, ($$anchor, Breadcrumbs_Item_3) => {
				Breadcrumbs_Item_3($$anchor, {
					href: 'https://svelteui.dev',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('Home');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});
			});

			var node_7 = $.sibling(node_6, 2);

			$.component(node_7, () => Breadcrumbs.Item, ($$anchor, Breadcrumbs_Item_4) => {
				Breadcrumbs_Item_4($$anchor, {
					active: true,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text('Application List');

						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}