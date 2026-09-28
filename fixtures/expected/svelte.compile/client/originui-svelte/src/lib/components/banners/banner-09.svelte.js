import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import Rocket from '@lucide/svelte/icons/rocket';
import X from '@lucide/svelte/icons/x';

var root = $.from_html(`<div class="dark bg-muted text-foreground px-4 py-3"><div class="flex gap-2 md:items-center"><div class="flex grow gap-3 md:items-center"><div class="bg-primary/15 flex size-9 shrink-0 items-center justify-center rounded-full max-md:mt-0.5" aria-hidden="true"><!></div> <div class="flex grow flex-col justify-between gap-3 md:flex-row md:items-center"><div class="space-y-0.5"><p class="text-sm font-medium">Boost your experience with Origin UI</p> <p class="text-muted-foreground text-sm">The new feature is live! Try it out and let us know what you think.</p></div> <div class="flex gap-2 max-md:flex-wrap"><!></div></div></div> <!></div></div>`);

export default function Banner_09($$anchor) {
	let visible = $.state(true);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var div_1 = $.child(div);
			var div_2 = $.child(div_1);
			var div_3 = $.child(div_2);
			var node_1 = $.child(div_3);

			Rocket(node_1, { class: 'opacity-80', size: 16 });
			$.reset(div_3);

			var div_4 = $.sibling(div_3, 2);
			var div_5 = $.sibling($.child(div_4), 2);
			var node_2 = $.child(div_5);

			Button(node_2, {
				size: 'sm',
				class: 'text-sm',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Try now');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.reset(div_5);
			$.reset(div_4);
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