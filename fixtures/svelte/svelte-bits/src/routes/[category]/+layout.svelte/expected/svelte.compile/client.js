import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DocsLayout from '$lib/components/docs/DocsLayout.svelte';

export default function _layout($$anchor, $$props) {
	DocsLayout($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.snippet(node, () => $$props.children);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}