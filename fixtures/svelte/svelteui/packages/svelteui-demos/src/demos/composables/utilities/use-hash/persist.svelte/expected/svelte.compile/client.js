import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Stack, Button } from '@svelteuidev/core';
import { useHash } from '@svelteuidev/composables';

const code = `
<script>
	import { useHash } from '@svelteuidev/composables';

	const id = useHash('my-library', true);
<\/script>

<p>Generated hash that won't change: <b>{id}</b></p>
`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <p>Generated hash that won't change: <b> </b></p>`, 1);

export default function Persist($$anchor, $$props) {
	$.push($$props, true);

	const id = useHash('my-library', true);

	Stack($$anchor, {
		align: 'center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Button(node, {
				$$events: { click: () => window.location.reload() },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Click to refresh the page');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var p = $.sibling(node, 2);
			var b = $.sibling($.child(p));
			var text_1 = $.only_child(b, true);

			$.reset(p);
			$.template_effect(() => $.set_text(text_1, id));
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}