import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card } from "$lib/components/ui/card";

var root = $.from_html(`<section><div class="bg-muted/50 py-24"><div class="mx-auto max-w-5xl px-6"><div><h2 class="text-4xl font-semibold text-foreground">Effortless Task Management</h2> <p class="mt-4 mb-12 text-lg text-balance text-muted-foreground">Automate your tasks and workflows by connecting your favorite tools like Notion,
					Todoist, and more. AI-powered scheduling helps you stay on track and adapt to
					changing priorities.</p></div> <div class="mt-8 grid gap-4 sm:grid-cols-2 md:mt-16 md:grid-cols-3"><div class="space-y-4"><!> <div class="sm:max-w-sm"><h3 class="text-xl font-semibold text-foreground">Marketing Campaigns</h3> <p class="my-4 text-lg text-muted-foreground">Effortlessly book and manage your meetings. Stay on top of your
							schedule.</p></div></div> <div class="space-y-4"><!> <div class="sm:max-w-sm"><h3 class="text-xl font-semibold text-foreground">AI Meeting Scheduler</h3> <p class="my-4 text-lg text-muted-foreground">Effortlessly book and manage your meetings. Stay on top of your
							schedule.</p></div></div> <div class="space-y-4"><!> <div class="sm:max-w-sm"><h3 class="text-xl font-semibold text-foreground">AI Meeting Scheduler</h3> <p class="my-4 text-lg text-muted-foreground">Effortlessly book and manage your meetings. Stay on top of your
							schedule.</p></div></div></div></div></div></section>`);

export default function Two($$anchor) {
	var section = root();
	var div = $.child(section);
	var div_1 = $.child(div);
	var div_2 = $.sibling($.child(div_1), 2);
	var div_3 = $.child(div_2);
	var node = $.child(div_3);

	Card(node, {
		variant: 'soft',
		class: 'aspect-video overflow-hidden px-6',
		children: ($$anchor, $$slotProps) => {
			Card($$anchor, { class: 'h-full translate-y-6' });
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_1 = $.child(div_4);

	Card(node_1, {
		variant: 'soft',
		class: 'aspect-video overflow-hidden p-6',
		children: ($$anchor, $$slotProps) => {
			Card($$anchor, { class: 'h-full' });
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_2 = $.child(div_5);

	Card(node_2, {
		variant: 'soft',
		class: 'aspect-video overflow-hidden',
		children: ($$anchor, $$slotProps) => {
			Card($$anchor, { class: 'h-full translate-6' });
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.reset(div_5);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}