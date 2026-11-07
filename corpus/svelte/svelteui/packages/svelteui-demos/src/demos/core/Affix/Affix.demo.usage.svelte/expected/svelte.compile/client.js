import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fly } from 'svelte/transition';
import { Affix, Button, Text } from '@svelteuidev/core';
import { ArrowUp } from 'radix-icons-svelte';

const code = `
<script>
  import { fly } from 'svelte/transition';
	import { Affix, Button, Text } from '@svelteuidev/core';
	import { ArrowUp } from 'radix-icons-svelte';

  let scrollY = 0;
<\/script>

<svelte:window on:scroll={() => scrollY = window.scrollY } />

<Text align="center">Affix is located at the bottom of the screen, scroll to see it</Text>
<Affix position={{ bottom: 20, right: 20 }}>
    {#if scrollY > 0}
        <div transition:fly={{ y: 20, duration: 250 }}>
            <Button on:click={() => window.scrollTo(0, 0)}>
                <svelte:fragment slot='leftIcon'>
                    <ArrowUp />
                </svelte:fragment>
                Scroll to top
            </Button>
        </div>
    {/if}
</Affix>`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Affix_demo_usage($$anchor) {
	let scrollY = 0;
	var fragment = root_1();

	$.event('scroll', $.window, () => scrollY = window.scrollY);

	var node = $.first_child(fragment);

	Text(node, {
		align: 'center',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Affix is located at the bottom of the screen, scroll to see it');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Affix(node_1, {
		position: { bottom: 20, right: 20 },
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node_2 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var div = root();
					var node_3 = $.child(div);

					Button(node_3, {
						$$events: { click: () => window.scrollTo(0, 0) },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Scroll to top');

							$.append($$anchor, text_1);
						},

						$$slots: {
							default: true,
							leftIcon: ($$anchor, $$slotProps) => {
								ArrowUp($$anchor, {});
							}
						}
					});

					$.reset(div);
					$.transition(3, div, () => fly, () => ({ y: 20, duration: 250 }));
					$.append($$anchor, div);
				};

				$.if(node_2, ($$render) => {
					if (scrollY > 0) $$render(consequent);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}