import * as $ from 'svelte/internal/server';
import { Button, Stack } from '@svelteuidev/core';
import { longpress } from '@svelteuidev/composables';

const code = `
<script>
    import { Button } from '@svelteuidev/core';
    import { longpress } from '@svelteuidev/composables';

    let pressed = false;
	let duration = 2000;
<\/script>

<div>
    <input type=range bind:value={duration} max={2000} step={100} />
    {duration}ms
</div>

<Button 
    use={[[longpress, duration]]}
    on:longpress="{() => pressed = true}"
    on:mouseenter="{() => pressed = false}"
>
    press and hold
</Button>

{#if pressed}
    <p>congratulations, you pressed and held for {duration} ms</p>
{/if}`;

export const type = 'demo';
export const configuration = { code };

export default function Usage($$renderer) {
	let pressed = false;
	let duration = 2000;

	Stack($$renderer, {
		align: 'center',
		children: ($$renderer) => {
			$$renderer.push(`<div><input type="range"${$.attr('value', duration)}${$.attr('max', 2000)}${$.attr('step', 100)}/> ${$.escape(duration)}ms</div> `);

			Button($$renderer, {
				use: [[longpress, duration]],
				children: ($$renderer) => {
					$$renderer.push(`<!---->Press and hold`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			if (pressed) {
				$$renderer.push(`<!--[0--><p>Congratulations, you pressed and held for ${$.escape(duration)} ms</p>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});
}