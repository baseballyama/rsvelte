import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Box, Button, Group, Overlay, Text } from '@svelteuidev/core';

const code = `<script>
	import { Box, Button, Group, Overlay } from '@svelteuidev/core';

  let visible = false;
<\/script>

<Box>
    {#if visible}
        <Overlay opacity={0.6} color="#000" zIndex={5} blur={2} />
    {/if}
    Overlay with a blur
</Box>

<Group children={1} position="center">
    <Button on:click={() => visible = !visible}>Toggle overlay</Button>
</Group>`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!>`, 1);

export default function Overlay_demo_blur($$anchor) {
	let visible = false;
	var fragment = root();
	var node = $.first_child(fragment);

	Box(node, {
		css: { height: 50, position: 'relative' },
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					Overlay($$anchor, { opacity: 0.6, color: '#000', zIndex: 5, blur: 2 });
				};

				$.if(node_1, ($$render) => {
					if (visible) $$render(consequent);
				});
			}

			var node_2 = $.sibling(node_1, 2);

			Text(node_2, {
				align: 'center',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Overlay with a blur');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node, 2);

	Group(node_3, {
		children: 1,
		position: 'center',
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				Button($$anchor, {
					$$events: { click: () => visible = !visible },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Toggle overlay');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});
			}
		}
	});

	$.append($$anchor, fragment);
}