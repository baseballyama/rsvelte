import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "$lib/components/ui/button/button.svelte";
import Header from "./header.svelte";

var root = $.from_html(`<!> <main class="overflow-hidden bg-muted/50 [--color-primary:theme(colors.indigo.500)]"><section><div class="relative py-24"><div class="mx-auto max-w-5xl px-6"><div><h1 class="mt-8 max-w-2xl text-5xl font-bold text-balance lg:text-6xl">Build 10x Faster with Mist</h1> <p class="my-6 max-w-2xl text-2xl text-balance text-foreground">Craft. Build. Ship Modern Websites With AI Support.</p> <div class="flex flex-col items-center gap-3 *:w-full sm:flex-row sm:*:w-fit"><!> <!></div></div> <div class="mt-8"><p class="font-medium text-muted-foreground">Trusted by teams at :</p> <div class="mt-4 flex items-center gap-12"><div class="flex"><img class="mx-auto h-5 w-fit" src="https://html.tailus.io/blocks/customers/nvidia.svg" alt="Nvidia Logo" height="20" width="auto"/></div> <div class="flex"><img class="mx-auto h-4 w-fit" src="https://html.tailus.io/blocks/customers/column.svg" alt="Column Logo" height="16" width="auto"/></div> <div class="flex"><img class="mx-auto h-4 w-fit" src="https://html.tailus.io/blocks/customers/github.svg" alt="GitHub Logo" height="16" width="auto"/></div> <div class="flex"><img class="mx-auto h-5 w-fit" src="https://html.tailus.io/blocks/customers/nike.svg" alt="Nike Logo" height="20" width="auto"/></div></div></div> <div class="relative mt-16 -mr-56 sm:mr-0"><div class="relative mx-auto overflow-hidden rounded-(--radius) border border-transparent bg-background shadow-lg shadow-black/10 ring-black/10"><img src="/mist/tailark-2.png" alt="app screen" width="2880" height="1842"/></div></div></div></div></section></main>`, 1);

export default function Hero_three($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Header(node, {});

	var main = $.sibling(node, 2);
	var section = $.child(main);
	var div = $.child(section);
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var div_3 = $.sibling($.child(div_2), 4);
	var node_1 = $.child(div_3);

	Button(node_1, {
		variant: 'mdefault',
		href: '/',
		size: 'lg',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Start Building');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		href: '/',
		size: 'lg',
		variant: 'outline',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Request a demo');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_3);
	$.reset(div_2);
	$.next(4);
	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.reset(main);
	$.append($$anchor, fragment);
}