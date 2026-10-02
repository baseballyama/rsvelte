import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Badge from '$lib/components/ui/badge.svelte';
import X from '@lucide/svelte/icons/x';

var root = $.from_html(`Tag <button class="focus-visible:outline-ring/70 -my-[5px] -ms-0.5 -me-2 inline-flex size-7 shrink-0 items-center justify-center rounded-[inherit] p-0 opacity-60 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-solid" aria-label="Delete"><!></button>`, 1);

export default function Badge_13($$anchor) {
	let isActive = $.state(true);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			Badge($$anchor, {
				variant: 'outline',
				class: 'rounded-md px-2 py-1',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_2 = root();
					var button = $.sibling($.first_child(fragment_2));
					var node_1 = $.child(button);

					X(node_1, { size: 14, 'aria-hidden': 'true' });
					$.reset(button);
					$.delegated('click', button, () => $.set(isActive, false));
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		};

		$.if(node, ($$render) => {
			if ($.get(isActive)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}

$.delegate(['click']);