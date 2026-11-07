import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Box, Button, Group, Overlay, Text } from '@svelteuidev/core';

const code = `
<script>
	import { Box, Button, Group, Overlay, Text } from '@svelteuidev/core';

  let visible = false;
  let count = 0;
<\/script>

<Box>
    {#if visible}
        <Overlay opacity={0.6} color="#000" zIndex={5} />
    {/if}
    <Button on:click={() => count++} color={visible ? 'red' : 'teal'}>
        {!visible ? 'Click as much as you like' : "Won't click, haha"}
    </Button>
</Box>
<Group children={2} direction='column' position="center">
    <Text>Count: {count}</Text>
    <Button on:click={() => visible = !visible}>Toggle overlay</Button>
</Group>`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!>`, 1);

export default function Overlay_demo_usage($$anchor) {
	let visible = false;
	let count = 0;
	var fragment = root();
	var node = $.first_child(fragment);

	Box(node, {
		css: {
			display: 'flex',
			justifyContent: 'center',
			height: 60,
			position: 'relative',
			textAlign: 'center'
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					Overlay($$anchor, { opacity: 0.6, color: '#000', zIndex: 5 });
				};

				$.if(node_1, ($$render) => {
					if (visible) $$render(consequent);
				});
			}

			var node_2 = $.sibling(node_1, 2);

			{
				let $0 = $.derived(() => visible ? 'red' : 'teal');

				Button(node_2, {
					get color() {
						return $.get($0);
					},
					$$events: { click: () => count++ },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text();

						$.template_effect(() => $.set_text(text, !visible ? 'Click as much as you like' : "Won't click, haha"));
						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node, 2);

	Group(node_3, {
		children: 2,
		direction: 'column',
		position: 'center',
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				var fragment_4 = root();
				var node_4 = $.first_child(fragment_4);

				Text(node_4, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text();

						$.template_effect(() => $.set_text(text_1, `Count: ${count ?? ''}`));
						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				var node_5 = $.sibling(node_4, 2);

				Button(node_5, {
					$$events: { click: () => visible = !visible },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('Toggle overlay');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_4);
			}
		}
	});

	$.append($$anchor, fragment);
}