import * as $ from 'svelte/internal/server';
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

export default function Checkbox_demo_icon($$renderer) {
	let indeterminate = true;

	Stack($$renderer, {
		position: 'center',
		children: ($$renderer) => {
			Checkbox($$renderer, {
				checked: true,
				label: 'Custom icon',
				children: ($$renderer) => {
					Rocket($$renderer, { size: 10 });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Checkbox($$renderer, {
				checked: true,
				label: 'Custom icon',
				indeterminate,
				children: ($$renderer) => {
					if (indeterminate) {
						$$renderer.push('<!--[0-->');
						HeartFilled($$renderer, { size: 10 });
					} else {
						$$renderer.push('<!--[-1-->');
						Heart($$renderer, { size: 10 });
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}