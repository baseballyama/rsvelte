import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import ClockIcon from '@lucide/svelte/icons/clock';
import { TimeField, TimeInput } from '$lib/components/ui/datefield-rac';

var root = $.from_html(`<!> <div class="relative"><!> <div class="text-muted-foreground/80 pointer-events-none absolute inset-y-0 end-0 z-10 flex items-center justify-center pe-3"><!></div></div> <p class="text-muted-foreground mt-2 text-xs" role="region" aria-live="polite">Built with <a class="hover:text-foreground underline" href="https://bits-ui.com/docs/components/time-field" target="_blank" rel="noopener nofollow">Bits UI</a></p>`, 1);

export default function Input_39($$anchor) {
	TimeField($$anchor, {
		class: '*:not-first:mt-2',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Label(node, {
				class: 'text-foreground text-sm font-medium',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Time input with end icon');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var div = $.sibling(node, 2);
			var node_1 = $.child(div);

			TimeInput(node_1, {});

			var div_1 = $.sibling(node_1, 2);
			var node_2 = $.child(div_1);

			ClockIcon(node_2, { size: 16, 'aria-hidden': 'true' });
			$.reset(div_1);
			$.reset(div);
			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}