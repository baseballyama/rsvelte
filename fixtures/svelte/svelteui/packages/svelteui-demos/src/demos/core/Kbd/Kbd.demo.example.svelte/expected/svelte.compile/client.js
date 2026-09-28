import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Kbd, TextInput, Box } from '@svelteuidev/core';
import { MagnifyingGlass } from 'radix-icons-svelte';

const code = `
<script>
  import { Kbd, TextInput } from '@svelteuidev/core';
  import { MagnifyingGlass } from 'radix-icons-svelte';
<\/script>

<TextInput
  placeholder="Search"
  icon={MagnifyingGlass}
  rightSectionWidth={90}
>
  <svelte:fragment slot='rightSection'>
    <Kbd>Ctrl</Kbd>
    <Box root='span'>+</Box>
    <Kbd>K</Kbd>
  </svelte:fragment>
</TextInput>`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Kbd_demo_example($$anchor) {
	TextInput($$anchor, {
		placeholder: 'Search',
		get icon() {
			return MagnifyingGlass;
		},
		rightSectionWidth: 90,
		override: { '&. rightSection': { pointerEvents: 'none' } },
		$$slots: {
			rightSection: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node = $.first_child(fragment_1);

				Kbd(node, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Ctrl');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				var node_1 = $.sibling(node, 2);

				Box(node_1, {
					root: 'span',
					css: { m: '0 5px' },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('+');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				var node_2 = $.sibling(node_1, 2);

				Kbd(node_2, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('K');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_1);
			}
		}
	});
}