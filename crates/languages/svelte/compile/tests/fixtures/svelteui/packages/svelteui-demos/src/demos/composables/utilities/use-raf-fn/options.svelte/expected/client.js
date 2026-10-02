import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Group } from '@svelteuidev/core';
import { useRafFn } from '@svelteuidev/composables';

const code = `
<script>
	import { Button } from '@svelteuidev/core';
	import { useRafFn } from '@svelteuidev/composables';

	let count = 0;
	const { pause, resume } = useRafFn(() => count++, {immediate: false});
<\/script>

<div>Count: {count}</div>
<Button on:click={() => pause()}>Pause</Button>
<Button on:click={() => resume()}>Resume</Button>
`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<div> </div> <!> <!>`, 1);

export default function Options($$anchor, $$props) {
	$.push($$props, true);

	let count = 0;
	const { pause, resume } = useRafFn(() => count++, { immediate: false });

	Group($$anchor, {
		position: 'center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var div = $.first_child(fragment_1);
			var text = $.only_child(div);
			var node = $.sibling(div, 2);

			Button(node, {
				$$events: { click: () => pause() },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Pause');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Button(node_1, {
				$$events: { click: () => resume() },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Resume');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.template_effect(() => $.set_text(text, `Count: ${count ?? ''}`));
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}