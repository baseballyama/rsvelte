import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Group } from '@svelteuidev/core';
import { useId } from '@svelteuidev/composables';

const code = `
<script>
	import { useId } from '@svelteuidev/composables';

	const uuid = useId()
<\/script>
	
<p>Generated Id: <b>{uuid}</b></p>
`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<p>Generated Id: <b> </b></p>`);

export default function Usage($$anchor, $$props) {
	$.push($$props, true);

	const uuid = useId();

	Group($$anchor, {
		position: 'center',
		children: ($$anchor, $$slotProps) => {
			var p = root();
			var b = $.sibling($.child(p));
			var text = $.only_child(b, true);

			$.reset(p);
			$.template_effect(() => $.set_text(text, uuid));
			$.append($$anchor, p);
		},
		$$slots: { default: true }
	});

	$.pop();
}