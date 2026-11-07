import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Box } from '@svelteuidev/core';
import { useOs } from '@svelteuidev/composables';

const code = `
<script>
	import { useOs } from '@svelteuidev/composables';
	const os = useOs();
<\/script>

<p>Your OS is <b>{os}</b></p>
`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<p>Your OS is <b> </b></p>`);

export default function Usage($$anchor, $$props) {
	$.push($$props, true);

	const os = useOs();

	Box($$anchor, {
		css: { d: 'flex', jc: 'center' },
		children: ($$anchor, $$slotProps) => {
			var p = root();
			var b = $.sibling($.child(p));
			var text = $.only_child(b, true);

			$.reset(p);
			$.template_effect(() => $.set_text(text, os));
			$.append($$anchor, p);
		},
		$$slots: { default: true }
	});

	$.pop();
}