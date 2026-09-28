import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import { DateField, DateInput } from '$lib/components/ui/datefield-rac';

export default function Input_40($$renderer) {
	DateField($$renderer, {
		class: '*:not-first:mt-2',
		granularity: 'minute',
		hourCycle: 24,
		children: ($$renderer) => {
			Label($$renderer, {
				class: 'text-foreground text-sm font-medium',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Date and time input`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);
			DateInput($$renderer, {});
			$$renderer.push(`<!----> <p class="text-muted-foreground mt-2 text-xs" role="region" aria-live="polite">Built with <a class="hover:text-foreground underline" href="https://bits-ui.com/docs/components/date-field" target="_blank" rel="noopener nofollow">Bits UI</a></p>`);
		},
		$$slots: { default: true }
	});
}