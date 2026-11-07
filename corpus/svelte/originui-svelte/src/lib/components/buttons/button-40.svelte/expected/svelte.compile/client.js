import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import ThumbsUpIcon from '@lucide/svelte/icons/thumbs-up';

var root = $.from_html(`<!> Like <span class="text-muted-foreground before:bg-input relative ms-1 inline-flex h-full items-center justify-center rounded-full px-3 text-xs font-medium before:absolute before:inset-0 before:left-0 before:w-px">86</span>`, 1);

export default function Button_40($$anchor) {
	Button($$anchor, {
		class: 'py-0 pe-0',
		variant: 'outline',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			ThumbsUpIcon(node, { class: 'opacity-60', size: 16, 'aria-hidden': 'true' });
			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}