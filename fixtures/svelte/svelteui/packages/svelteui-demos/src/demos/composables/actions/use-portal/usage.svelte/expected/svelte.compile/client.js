import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Box, Button, Stack } from '@svelteuidev/core';
import { portal } from '@svelteuidev/composables';

const code = `
<script>
    import { Box, Button } from '@svelteuidev/core';
    import { portal } from '@svelteuidev/composables';

    let magic = false;
<\/script>

{#if magic}
    <div>
        Look at the top of the page
    </div>
{/if}
<div>
    <Box 
        use={[[portal, magic ? 'h1' : null]]}
        css={{bc: 'white', border: '1px solid black', br: '$md', padding: '$md'}} 
    >
        I'm being rendered {magic ? 'outside' : 'inside'} of the preview
    </Box>
</div>
<Button on:click={() => magic = !magic}>Click me to see the magic</Button>`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<div>Look at the top of the page</div>`);
var root_1 = $.from_html(`<!> <div><!></div> <!>`, 1);

export default function Usage($$anchor) {
	let magic = false;

	Stack($$anchor, {
		align: 'center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var div = root();

					$.append($$anchor, div);
				};

				$.if(node, ($$render) => {
					if (magic) $$render(consequent);
				});
			}

			var div_1 = $.sibling(node, 2);
			var node_1 = $.child(div_1);

			{
				let $0 = $.derived(() => [[portal, magic ? 'h1' : null]]);

				Box(node_1, {
					get use() {
						return $.get($0);
					},

					css: {
						bc: 'white',
						border: '1px solid black',
						br: '$md',
						padding: '$md'
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text();

						$.template_effect(() => $.set_text(text, `I'm being rendered ${magic ? 'outside' : 'inside'} of the preview`));
						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			}

			$.reset(div_1);

			var node_2 = $.sibling(div_1, 2);

			Button(node_2, {
				$$events: { click: () => magic = !magic },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Click me to see the magic');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}