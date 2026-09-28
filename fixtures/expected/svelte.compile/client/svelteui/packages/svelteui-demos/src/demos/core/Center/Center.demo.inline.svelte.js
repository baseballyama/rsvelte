import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Center, Box } from '@svelteuidev/core';
import { ArrowLeft } from 'radix-icons-svelte';

const code = `
    <script>
        import { Anchor, Center, Box } from '@svelteuidev/core';
    <\/script>
    
    <Anchor href="https://svelteui.dev" target="_blank">
      <Center inline>
        <ArrowLeft size={14} />
        <Box css={{ ml: 5 }}>Back to SvelteUI website</Box>
      </Center>
    </Anchor>
	`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!>`, 1);

export default function Center_demo_inline($$anchor) {
	Box($$anchor, {
		css: { color: '$blue600' },
		root: 'a',
		href: '/',
		target: '_blank',
		children: ($$anchor, $$slotProps) => {
			Center($$anchor, {
				inline: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					ArrowLeft(node, { size: 14 });

					var node_1 = $.sibling(node, 2);

					Box(node_1, {
						css: { ml: 5 },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Back to the homepage');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}