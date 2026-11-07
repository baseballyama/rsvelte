import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import CircleCheck from '@lucide/svelte/icons/circle-check';
import X from '@lucide/svelte/icons/x';
import { toast } from 'svelte-sonner';

const customToastSnippet = ($$anchor, toastId = $.noop) => {
	var div = root();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node_1 = $.child(div_2);

	CircleCheck(node_1, {
		class: 'mt-0.5 shrink-0 text-emerald-500',
		size: 16,
		'aria-hidden': 'true'
	});

	var div_3 = $.sibling(node_1, 2);
	var div_4 = $.sibling($.child(div_3), 2);
	var button = $.sibling($.child(div_4), 4);

	$.reset(div_4);
	$.reset(div_3);
	$.reset(div_2);

	var node_2 = $.sibling(div_2, 2);

	Button(node_2, {
		variant: 'ghost',
		class: 'group -my-1.5 -me-2 size-8 shrink-0 p-0 hover:bg-transparent',
		'aria-label': 'Close banner',
		onclick: () => toast.dismiss(toastId()),
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
	$.delegated('click', button, () => toast.dismiss(toastId()));
	$.append($$anchor, div);
};

var root = $.from_html(`<div class="border-border bg-background w-(--width) rounded-lg border px-4 py-3"><div class="flex gap-2"><div class="flex grow gap-3"><!> <div class="flex grow justify-between gap-12"><p class="text-sm">Message sent</p> <div class="text-sm whitespace-nowrap"><button class="text-sm font-medium hover:underline">View</button> <span class="text-muted-foreground mx-1">·</span> <button class="text-sm font-medium hover:underline">Undo</button></div></div></div> <!></div></div>`);

export default function Notification_22($$anchor, $$props) {
	$.push($$props, true);

	function openToast() {
		const newId = Math.random();

		//the implementation will change, once https://github.com/wobsoriano/svelte-sonner/pull/126 lands
		//@ts-expect-error - this is a hack to get the toast id, dont use in production
		toast.custom((node) => customToastSnippet(node, () => newId), { id: newId });
	}

	Button($$anchor, {
		variant: 'outline',
		onclick: () => openToast(),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Custom sonner');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.pop();
}

$.delegate(['click']);