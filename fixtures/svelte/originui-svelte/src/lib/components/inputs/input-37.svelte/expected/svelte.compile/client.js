import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import { TimeField, TimeInput } from '$lib/components/ui/datefield-rac';

var root = $.from_html(`<!> <!> <p class="text-muted-foreground mt-2 text-xs" role="region" aria-live="polite">Built with <a class="hover:text-foreground underline" href="https://bits-ui.com/docs/components/time-field" target="_blank" rel="noopener nofollow">Bits UI</a></p>`, 1);

export default function Input_37($$anchor) {
	TimeField($$anchor, {
		class: '*:not-first:mt-2',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Label(node, {
				class: 'text-foreground text-sm font-medium',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Time input');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			TimeInput(node_1, {});
			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}