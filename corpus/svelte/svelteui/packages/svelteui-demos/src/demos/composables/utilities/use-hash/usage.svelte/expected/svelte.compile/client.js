import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Group } from '@svelteuidev/core';
import { useHash } from '@svelteuidev/composables';

const code = `
<script>
	import { useHash } from '@svelteuidev/composables';

	const id = useHash('sveleteui');
<\/script>

<p>Generated hash: {id}</p>
`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<p>Generated hash: <b> </b></p>`);

export default function Usage($$anchor, $$props) {
	$.push($$props, true);

	const id = useHash('sveleteui');

	Group($$anchor, {
		position: 'center',
		children: ($$anchor, $$slotProps) => {
			var p = root();
			var b = $.sibling($.child(p));
			var text = $.only_child(b, true);

			$.reset(p);
			$.template_effect(() => $.set_text(text, id));
			$.append($$anchor, p);
		},
		$$slots: { default: true }
	});

	$.pop();
}