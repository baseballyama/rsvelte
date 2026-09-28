import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/components/ui/veil/button";
import ChevronRight from "@lucide/svelte/icons/chevron-right";
import Mail from "@lucide/svelte/icons/mail";

var root = $.from_html(` <!>`, 1);
var root_1 = $.from_html(`<section class="@container bg-background py-24"><div class="mx-auto max-w-2xl px-6"><div class="grid items-center gap-8 text-center @xl:text-left"><div><h2 class="font-serif text-3xl font-medium text-balance md:text-4xl"> </h2> <p class="mt-3 text-balance text-muted-foreground"> </p></div> <div class="flex w-full max-w-sm gap-2 @max-xl:mx-auto @max-md:flex-col"><div class="relative flex flex-1 items-center overflow-hidden rounded-md border border-transparent ring ring-input not-dark:bg-card focus-within:border-primary focus-within:ring-[3px] focus-within:ring-ring/15"><!> <input type="email" autocomplete="email" class="h-8 w-full bg-transparent pr-2.5 pl-8 text-sm outline-none autofill:bg-primary"/></div> <!></div></div></div></section>`);

export default function Call_to_action_three($$anchor, $$props) {
	let title = $.prop($$props, 'title', 3, "Stay in the Loop"),
		description = $.prop($$props, 'description', 3, "Get the latest updates, tips, and exclusive offers delivered straight to your inbox."),
		emailPlaceholder = $.prop($$props, 'emailPlaceholder', 3, "Enter your email"),
		subscribeLabel = $.prop($$props, 'subscribeLabel', 3, "Subscribe"),
		subscribeHref = $.prop($$props, 'subscribeHref', 3, "#link");

	var section = root_1();
	var div = $.child(section);
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var h2 = $.child(div_2);
	var text = $.only_child(h2, true);
	var p = $.sibling(h2, 2);
	var text_1 = $.only_child(p, true);

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var div_4 = $.child(div_3);
	var node = $.child(div_4);

	Mail(node, {
		class: 'pointer-events-none absolute left-2.5 size-3.5 text-muted-foreground'
	});

	var input = $.sibling(node, 2);

	$.reset(div_4);

	var node_1 = $.sibling(div_4, 2);

	Button(node_1, {
		get href() {
			return subscribeHref();
		},
		class: 'shrink-0 pr-1.5',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment = root();
			var text_2 = $.first_child(fragment);
			var node_2 = $.sibling(text_2);

			ChevronRight(node_2, { class: 'opacity-50' });
			$.template_effect(() => $.set_text(text_2, `${subscribeLabel() ?? ''} `));
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div_3);
	$.reset(div_1);
	$.reset(div);
	$.reset(section);

	$.template_effect(() => {
		$.set_text(text, title());
		$.set_text(text_1, description());
		$.set_attribute(input, 'placeholder', emailPlaceholder());
	});

	$.append($$anchor, section);
}