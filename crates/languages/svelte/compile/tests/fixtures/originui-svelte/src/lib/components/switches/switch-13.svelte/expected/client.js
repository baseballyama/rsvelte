import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import Switch from '$lib/components/ui/switch.svelte';
import IconMoon from '@lucide/svelte/icons/moon';
import IconSun from '@lucide/svelte/icons/sun';

var root = $.from_html(`<div><div class="relative inline-grid h-9 grid-cols-[1fr_1fr] items-center text-sm font-medium"><!> <span class="pointer-events-none relative ms-0.5 flex min-w-8 items-center justify-center text-center transition-transform duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] peer-data-[state=checked]:invisible peer-data-[state=unchecked]:translate-x-full peer-data-[state=unchecked]:rtl:-translate-x-full"><!></span> <span class="peer-data-[state=checked]:text-background pointer-events-none relative me-0.5 flex min-w-8 items-center justify-center text-center transition-transform duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] peer-data-[state=checked]:-translate-x-full peer-data-[state=unchecked]:invisible peer-data-[state=checked]:rtl:translate-x-full"><!></span></div> <!></div>`);

export default function Switch_13($$anchor) {
	const uid = $.props_id();
	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Switch(node, {
		get id() {
			return uid;
		},
		checked: true,
		class: 'peer data-[state=unchecked]:bg-input/50 absolute inset-0 h-[inherit] w-auto [&_span]:z-10 [&_span]:h-full [&_span]:w-1/2 [&_span]:transition-transform [&_span]:duration-300 [&_span]:[transition-timing-function:cubic-bezier(0.16,1,0.3,1)] [&_span]:data-[state=checked]:translate-x-full [&_span]:data-[state=checked]:rtl:-translate-x-full'
	});

	var span = $.sibling(node, 2);
	var node_1 = $.child(span);

	IconMoon(node_1, { size: 16, 'aria-hidden': 'true' });
	$.reset(span);

	var span_1 = $.sibling(span, 2);
	var node_2 = $.child(span_1);

	IconSun(node_2, { size: 16, 'aria-hidden': 'true' });
	$.reset(span_1);
	$.reset(div_1);

	var node_3 = $.sibling(div_1, 2);

	Label(node_3, {
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