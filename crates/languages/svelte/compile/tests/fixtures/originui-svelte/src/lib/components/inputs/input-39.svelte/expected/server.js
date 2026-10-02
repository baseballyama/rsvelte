import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import ClockIcon from '@lucide/svelte/icons/clock';
import { TimeField, TimeInput } from '$lib/components/ui/datefield-rac';

export default function Input_39($$renderer) {
	TimeField($$renderer, {
		class: '*:not-first:mt-2',
		children: ($$renderer) => {
			Label($$renderer, {
				class: 'text-foreground text-sm font-medium',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Time input with end icon`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="relative">`);
			TimeInput($$renderer, {});
			$$renderer.push(`<!----> <div class="text-muted-foreground/80 pointer-events-none absolute inset-y-0 end-0 z-10 flex items-center justify-center pe-3">`);
			ClockIcon($$renderer, { size: 16, 'aria-hidden': 'true' });
			$$renderer.push(`<!----></div></div> <p class="text-muted-foreground mt-2 text-xs" role="region" aria-live="polite">Built with <a class="hover:text-foreground underline" href="https://bits-ui.com/docs/components/time-field" target="_blank" rel="noopener nofollow">Bits UI</a></p>`);
		},
		$$slots: { default: true }
	});
}