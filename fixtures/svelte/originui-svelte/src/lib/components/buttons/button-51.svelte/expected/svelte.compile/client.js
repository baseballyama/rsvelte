import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';

var root = $.from_html(`<div class="space-y-1"><h3>Talent Agency</h3> <p class="text-muted-foreground font-normal whitespace-break-spaces">Matches for your roster</p></div> <!>`, 1);

export default function Button_51($$anchor) {
	Button($$anchor, {
		class: 'group h-auto gap-4 py-3 text-left',
		variant: 'outline',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.sibling($.first_child(fragment_1), 2);

			ChevronRightIcon(node, {
				class: 'opacity-60 transition-transform group-hover:translate-x-0.5',
				size: 16,
				'aria-hidden': 'true'
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}