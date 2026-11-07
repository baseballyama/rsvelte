import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "$lib/components/ui/button/button.svelte";
import { cn } from "$lib/utils";
import BookOpen from "@lucide/svelte/icons/book-open";

const MistKitLogo = ($$anchor, $$arg0) => {
	let _class = $.derived_safe_equal(() => $.fallback($$arg0?.(), ""));
	var div = root();
	var node = $.child(div);

	BookOpen(node, {
		class: 'size-6 mask-b-from-25% fill-white stroke-white drop-shadow-sm'
	});

	var node_1 = $.sibling(node, 2);

	BookOpen(node_1, {
		class: 'absolute inset-0 m-auto size-6 fill-white stroke-white opacity-65 drop-shadow-sm'
	});

	$.next(2);
	$.reset(div);

	$.template_effect(($0) => $.set_class(div, 1, $0), [
		() => $.clsx(cn("relative flex size-9 translate-y-0.5 items-center justify-center rounded-(--radius) border border-background bg-linear-to-b from-yellow-300 to-orange-600 shadow-lg ring-1 shadow-black/20 ", $.get(_class)))
	]);

	$.append($$anchor, div);
};

var root = $.from_html(`<div aria-hidden="true"><!> <!> <div class="absolute inset-2 z-1 m-auto h-4.5 w-px translate-y-px rounded-full bg-black/10"></div></div>`);
var root_1 = $.from_html(`<section class="py-20 [--color-primary:theme(colors.indigo.500)]"><div class="relative z-10 mx-auto w-full max-w-2xl px-6 lg:px-0"><div class="relative"><!> <h1 class="mt-16 max-w-xl text-5xl font-medium text-balance">The Note App</h1> <p class="mt-4 mb-6 text-xl text-balance text-muted-foreground">The Note App is a simple note app that allows you to create and manage your notes.</p> <div class="flex flex-col items-center gap-2 *:w-full sm:flex-row sm:*:w-auto"><!> <!></div></div> <div class="relative mt-12 overflow-hidden rounded-3xl bg-black/10 md:mt-16"><img src="https://images.unsplash.com/photo-1547623641-d2c56c03e2a7?q=80&amp;w=3087&amp;auto=format&amp;fit=crop&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" class="absolute inset-0 size-full object-cover"/> <div class="relative m-4 overflow-hidden rounded-(--radius) border border-transparent bg-background shadow-xl ring-1 shadow-black/15 sm:m-8 md:m-12"><img src="/mist/tailark-2.png" alt="app screen" width="2880" height="1842" class="size-full object-cover object-top-left"/></div></div> <div class="mt-8 flex flex-wrap items-center gap-4"><p class="text-center text-muted-foreground">Trusted by teams at :</p> <div class="flex items-center justify-center gap-8"><div class="flex"><img class="mx-auto h-4 w-fit" src="https://html.tailus.io/blocks/customers/nvidia.svg" alt="Nvidia Logo" height="20" width="auto"/></div> <div class="flex"><img class="mx-auto h-3 w-fit" src="https://html.tailus.io/blocks/customers/column.svg" alt="Column Logo" height="16" width="auto"/></div> <div class="flex"><img class="mx-auto h-3 w-fit" src="https://html.tailus.io/blocks/customers/github.svg" alt="GitHub Logo" height="16" width="auto"/></div> <div class="flex"><img class="mx-auto h-4 w-fit" src="https://html.tailus.io/blocks/customers/nike.svg" alt="Nike Logo" height="20" width="auto"/></div></div></div></div></section>`);

export default function Hero_six($$anchor, $$props) {
	$.push($$props, true);

	var section = root_1();
	var div_1 = $.child(section);
	var div_2 = $.child(div_1);
	var node_2 = $.child(div_2);

	MistKitLogo(node_2);

	var div_3 = $.sibling(node_2, 6);
	var node_3 = $.child(div_3);

	Button(node_3, {
		variant: 'mdefault',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Get Started');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Button(node_4, {
		variant: 'ghost',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('View Demo');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_3);
	$.reset(div_2);
	$.next(4);
	$.reset(div_1);
	$.reset(section);
	$.append($$anchor, section);
	$.pop();
}