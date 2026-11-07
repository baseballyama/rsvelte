import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox, Stack } from '@svelteuidev/core';
import { Heart, HeartFilled, Rocket } from 'radix-icons-svelte';

const code = `<script>
    import { Checkbox } from '@svelteuidev/core';
    import { Heart, HeartFilled, Rocket } from 'radix-icons-svelte';

    let indeterminate = true;
<\/script>

<Checkbox checked label="Custom icon">
    <Rocket size={10} />    
</Checkbox>
<Checkbox checked label="Custom icon" {indeterminate}>
    {#if indeterminate}
        <HeartFilled size={10} />
    {:else}
        <Heart size={10} />
    {/if}
</Checkbox>`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!>`, 1);

export default function Checkbox_demo_icon($$anchor) {
	let indeterminate = true;

	Stack($$anchor, {
		position: 'center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Checkbox(node, {
				checked: true,
				label: 'Custom icon',
				children: ($$anchor, $$slotProps) => {
					Rocket($$anchor, { size: 10 });
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Checkbox(node_1, {
				checked: true,
				label: 'Custom icon',
				indeterminate,
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = $.comment();
					var node_2 = $.first_child(fragment_3);

					{
						var consequent = ($$anchor) => {
							HeartFilled($$anchor, { size: 10 });
						};

						var alternate = ($$anchor) => {
							Heart($$anchor, { size: 10 });
						};

						$.if(node_2, ($$render) => {
							if (indeterminate) $$render(consequent); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}