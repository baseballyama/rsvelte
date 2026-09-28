import * as $ from 'svelte/internal/server';
import { Stack } from '@svelteuidev/core';
import { lazy } from '@svelteuidev/composables';

const code = `
<script>
    import { lazy } from '@svelteuidev/composables';
<\/script>

{#each [...Array(15).keys()] as i}
	<p>
		Lorem ipsum dolor sit amet consectetur adipisicing elit. Aspernatur obcaecati ex totam laboriosam, culpa ipsa quis nostrum odio dolore aut eos numquam ratione quam maiores voluptates quas eius labore error?
	</p>
{/each}
<img use:lazy={{src: "https://images.unsplash.com/photo-1584441111639-2fe3005b4378"}} alt="" />`;

export const type = 'demo';
export const configuration = { code };

export default function Usage($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		Stack($$renderer, {
			override: { height: '300px', overflow: 'scroll', padding: '1rem' },
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like([...Array(15).keys()]);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let i = each_array[$$index];

					$$renderer.push(`<p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Aspernatur obcaecati ex totam
			laboriosam, culpa ipsa quis nostrum odio dolore aut eos numquam ratione quam maiores
			voluptates quas eius labore error?</p>`);
				}

				$$renderer.push(`<!--]--> <img alt="" onload="this.__e=event" onerror="this.__e=event"/>`);
			},
			$$slots: { default: true }
		});
	});
}