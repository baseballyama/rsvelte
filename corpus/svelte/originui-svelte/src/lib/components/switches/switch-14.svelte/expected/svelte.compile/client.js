import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import Switch from '$lib/components/ui/switch.svelte';

var root = $.from_html(`<div><div class="relative inline-grid h-9 grid-cols-[1fr_1fr] items-center text-sm font-medium"><!> <span class="min-w-78flex pointer-events-none relative ms-0.5 items-center justify-center px-2 text-center transition-transform duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] peer-data-[state=checked]:invisible peer-data-[state=unchecked]:translate-x-full peer-data-[state=unchecked]:rtl:-translate-x-full"><span class="text-[10px] font-medium uppercase">Off</span></span> <span class="min-w-78flex peer-data-[state=checked]:text-background pointer-events-none relative me-0.5 items-center justify-center px-2 text-center transition-transform duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] peer-data-[state=checked]:-translate-x-full peer-data-[state=unchecked]:invisible peer-data-[state=checked]:rtl:translate-x-full"><span class="text-[10px] font-medium uppercase">On</span></span></div> <!></div>`);

export default function Switch_14($$anchor) {
	const uid = $.props_id();
	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Switch(node, {
		get id() {
			return uid;
		},
		checked: true,
		class: 'peer data-[state=unchecked]:bg-input/50 absolute inset-0 h-[inherit] w-auto rounded-lg [&_span]:z-10 [&_span]:h-full [&_span]:w-1/2 [&_span]:rounded-md [&_span]:transition-transform [&_span]:duration-300 [&_span]:[transition-timing-function:cubic-bezier(0.16,1,0.3,1)] [&_span]:data-[state=checked]:translate-x-full [&_span]:data-[state=checked]:rtl:-translate-x-full'
	});

	$.next(4);
	$.reset(div_1);

	var node_1 = $.sibling(div_1, 2);

	Label(node_1, {
		get for() {
			return uid;
		},
		class: 'sr-only',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Labeled switch');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}