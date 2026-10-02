import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Aspernatur obcaecati ex totam
			laboriosam, culpa ipsa quis nostrum odio dolore aut eos numquam ratione quam maiores
			voluptates quas eius labore error?</p>`);

var root_1 = $.from_html(`<!> <img alt=""/>`, 1);

export default function Usage($$anchor, $$props) {
	$.push($$props, true);

	Stack($$anchor, {
		override: { height: '300px', overflow: 'scroll', padding: '1rem' },
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			$.each(node, 16, () => [...Array(15).keys()], $.index, ($$anchor, i) => {
				var p = root();

				$.append($$anchor, p);
			});

			var img = $.sibling(node, 2);

			$.action(img, ($$node, $$action_arg) => lazy?.($$node, $$action_arg), () => ({
				src: 'https://images.unsplash.com/photo-1584441111639-2fe3005b4378'
			}));

			$.replay_events(img);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}