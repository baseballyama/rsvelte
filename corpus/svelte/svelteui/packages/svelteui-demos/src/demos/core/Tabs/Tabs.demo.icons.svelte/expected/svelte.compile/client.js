import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tabs } from '@svelteuidev/core';
import { Camera, EnvelopeClosed, Gear } from 'radix-icons-svelte';

const code = `<script>
	import { Tabs } from '@svelteuidev/core';
    import { Camera, EnvelopeClosed, Gear } from 'radix-icons-svelte';
<\/script>

<Tabs>
    <Tabs.Tab label='Gallery' icon={Camera}>Gallery tab content</Tabs.Tab>
    <Tabs.Tab label='Messages' icon={EnvelopeClosed}>Messages tab content</Tabs.Tab>
    <Tabs.Tab icon={Gear}>Settings tab content</Tabs.Tab>
</Tabs>`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Tabs_demo_icons($$anchor) {
	Tabs($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			$.component(node, () => Tabs.Tab, ($$anchor, Tabs_Tab) => {
				Tabs_Tab($$anchor, {
					label: 'Gallery',
					get icon() {
						return Camera;
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Gallery tab content');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			var node_1 = $.sibling(node, 2);

			$.component(node_1, () => Tabs.Tab, ($$anchor, Tabs_Tab_1) => {
				Tabs_Tab_1($$anchor, {
					label: 'Messages',
					get icon() {
						return EnvelopeClosed;
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Messages tab content');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});
			});

			var node_2 = $.sibling(node_1, 2);

			$.component(node_2, () => Tabs.Tab, ($$anchor, Tabs_Tab_2) => {
				Tabs_Tab_2($$anchor, {
					get icon() {
						return Gear;
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('Settings tab content');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}