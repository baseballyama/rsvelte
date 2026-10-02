import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "$lib/components/ui/button/button.svelte";
import CalendarCheck from "@lucide/svelte/icons/calendar-check";
import ChevronRight from "@lucide/svelte/icons/chevron-right";
import Target from "@lucide/svelte/icons/target";

var root = $.from_html(`Learn more <!>`, 1);

var root_1 = $.from_html(`<section class="[--color-primary:theme(color.indigo.500)] [--color-secondary-foreground:theme(color.indigo.600)] [--color-secondary:theme(color.indigo.100)] dark:[--color-primary:theme(color.indigo.400)] dark:[--color-secondary-foreground:theme(color.indigo.500)] dark:[--color-secondary:theme(color.indigo.400)]"><div class="bg-muted/50 py-24"><div class="mx-auto w-full max-w-5xl px-6"><div class="grid gap-12 md:grid-cols-5"><div class="md:col-span-2"><h2 class="text-4xl font-semibold text-balance text-foreground">The AI Coding Assistant that helps you write code faster</h2> <!></div> <div class="space-y-6 md:col-span-3 md:space-y-10"><div><div class="flex items-center gap-2"><!> <h3 class="text-lg font-semibold text-foreground">Code Generation</h3></div> <p class="mt-3 text-balance text-muted-foreground">Just describe the code you want to write and we'll generate it for you.
							From boilerplate code to complex business logic, we've got you covered.</p></div> <div><div class="flex items-center gap-2"><!> <h3 class="text-lg font-semibold text-foreground">Code Review</h3></div> <p class="mt-3 text-balance text-muted-foreground">Get instant feedback on your code. Our AI will review your code and
							suggest improvements in terms of best practices and performance.</p></div></div></div> <div class="relative -mx-12 mt-16 px-12"><div class="relative mx-auto overflow-hidden rounded-xl border border-foreground/20 bg-background shadow-lg ring-1 shadow-black/10"><img src="/mist/tailark-2.png" alt="app screen" width="2880" height="1842"/></div></div></div></div></section>`);

export default function Five($$anchor) {
	var section = root_1();
	var div = $.child(section);
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var node = $.sibling($.child(div_3), 2);

	Button(node, {
		class: 'mt-8 pr-2',
		variant: 'outline',
		href: '/',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment = root();
			var node_1 = $.sibling($.first_child(fragment));

			ChevronRight(node_1, { class: 'size-4 opacity-50' });
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var div_5 = $.child(div_4);
	var div_6 = $.child(div_5);
	var node_2 = $.child(div_6);

	Target(node_2, { class: 'size-5' });
	$.next(2);
	$.reset(div_6);
	$.next(2);
	$.reset(div_5);

	var div_7 = $.sibling(div_5, 2);
	var div_8 = $.child(div_7);
	var node_3 = $.child(div_8);

	CalendarCheck(node_3, { class: 'size-5' });
	$.next(2);
	$.reset(div_8);
	$.next(2);
	$.reset(div_7);
	$.reset(div_4);
	$.reset(div_2);
	$.next(2);
	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}