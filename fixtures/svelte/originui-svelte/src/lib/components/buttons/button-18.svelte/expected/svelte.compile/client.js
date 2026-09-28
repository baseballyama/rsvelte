import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import ChevronDown from '@lucide/svelte/icons/chevron-down';

var root = $.from_html(`<enhanced:img class="size-[40px] rounded-full" src="/static/avatar.jpg" alt="Profile image" loading="lazy" aria-hidden="true"></enhanced:img> <!>`, 1);

export default function Button_18($$anchor) {
	Button($$anchor, {
		variant: 'ghost',
		class: 'h-auto p-0 hover:bg-transparent',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.sibling($.first_child(fragment_1), 2);

			ChevronDown(node, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}