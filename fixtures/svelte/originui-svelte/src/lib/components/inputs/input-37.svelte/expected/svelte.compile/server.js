import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import { TimeField, TimeInput } from '$lib/components/ui/datefield-rac';

export default function Input_37($$renderer) {
	TimeField($$renderer, {
		class: '*:not-first:mt-2',
		children: ($$renderer) => {
			Label($$renderer, {
				class: 'text-foreground text-sm font-medium',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Time input`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);
			TimeInput($$renderer, {});
			$$renderer.push(`<!----> <p class="text-muted-foreground mt-2 text-xs" role="region" aria-live="polite">Built with <a class="hover:text-foreground underline" href="https://bits-ui.com/docs/components/time-field" target="_blank" rel="noopener nofollow">Bits UI</a></p>`);
		},
		$$slots: { default: true }
	});
}