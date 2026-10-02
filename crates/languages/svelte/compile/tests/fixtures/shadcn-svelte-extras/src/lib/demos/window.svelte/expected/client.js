import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Window } from '$lib/components/ui/window';

var root = $.from_html(`<strong># Window</strong> <p>An awesome styled window component.</p>`, 1);

export default function Window_1($$anchor) {
	Window($$anchor, {
		class: 'm-6 max-w-xl',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();

			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}