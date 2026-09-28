import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import ArrowRight from '@lucide/svelte/icons/arrow-right';
import Eclipse from '@lucide/svelte/icons/eclipse';
import X from '@lucide/svelte/icons/x';

var root = $.from_html(`<div class="dark bg-muted text-foreground px-4 py-3"><div class="flex gap-2"><div class="flex grow gap-3"><!> <div class="flex grow flex-col justify-between gap-2 md:flex-row"><p class="text-sm">We just added something awesome to make your experience even better.</p> <a href="#title" class="group text-sm font-medium whitespace-nowrap">Learn more<!></a></div></div> <!></div></div>`);

export default function Banner_05($$anchor) {
	let visible = $.state(true);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var div_1 = $.child(div);
			var div_2 = $.child(div_1);
			var node_1 = $.child(div_2);

			Eclipse(node_1, {
				class: 'mt-0.5 shrink-0 opacity-60',
				size: 16,
				'aria-hidden': 'true'
			});

			var div_3 = $.sibling(node_1, 2);
			var a = $.sibling($.child(div_3), 2);
			var node_2 = $.sibling($.child(a));

			ArrowRight(node_2, {
				class: 'ms-1 -mt-0.5 inline-flex opacity-60 transition-transform group-hover:translate-x-0.5',
				size: 16,
				'aria-hidden': 'true'
			});

			$.reset(a);
			$.reset(div_3);
			$.reset(div_2);

			var node_3 = $.sibling(div_2, 2);

			Button(node_3, {
				variant: 'ghost',
				class: 'group -my-1.5 -me-2 size-8 shrink-0 p-0 hover:bg-transparent',
				onclick: () => $.set(visible, false),
				'aria-label': 'Close banner',
				children: ($$anchor, $$slotProps) => {
					X($$anchor, {
						size: 16,
						class: 'opacity-60 transition-opacity group-hover:opacity-100',
						'aria-hidden': 'true'
					});
				},
				$$slots: { default: true }
			});

			$.reset(div_1);
			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(visible)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}