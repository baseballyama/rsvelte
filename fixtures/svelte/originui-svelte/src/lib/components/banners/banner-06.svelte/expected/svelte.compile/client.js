import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import Eclipse from '@lucide/svelte/icons/eclipse';
import X from '@lucide/svelte/icons/x';

var root = $.from_html(`<div class="dark bg-muted text-foreground px-4 py-3 md:py-2"><div class="flex gap-2 md:items-center"><div class="flex grow gap-3 md:items-center"><!> <div class="flex grow flex-col justify-between gap-3 md:flex-row md:items-center"><p class="text-sm">It&lsquo;s live and ready to use! Start exploring the latest addition to your toolkit.</p> <div class="flex gap-2 max-md:flex-wrap"><!> <!></div></div></div> <!></div></div>`);

export default function Banner_06($$anchor) {
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
				class: 'shrink-0 opacity-60 max-md:mt-0.5',
				size: 16,
				'aria-hidden': 'true'
			});

			var div_3 = $.sibling(node_1, 2);
			var div_4 = $.sibling($.child(div_3), 2);
			var node_2 = $.child(div_4);

			Button(node_2, {
				size: 'sm',
				class: 'text-sm',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Download');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Button(node_3, {
				variant: 'outline',
				size: 'sm',
				class: 'text-sm',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Learn more');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.reset(div_4);
			$.reset(div_3);
			$.reset(div_2);

			var node_4 = $.sibling(div_2, 2);

			Button(node_4, {
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