import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card } from "$lib/components/ui/card";
import FeatureTable from "./feature-table.svelte";

var root = $.from_html(`<section class="[--color-primary:theme(color.indigo.500)] [--color-secondary-foreground:theme(color.indigo.600)] [--color-secondary:theme(color.indigo.100)] dark:[--color-primary:theme(color.indigo.400)] dark:[--color-secondary-foreground:theme(color.indigo.500)] dark:[--color-secondary:theme(color.indigo.400)]"><div class="bg-muted/50 py-24"><div class="mx-auto w-full max-w-5xl px-6"><div><h2 class="text-4xl font-semibold text-foreground">Effortless Task Management</h2> <p class="mt-4 mb-12 text-lg text-balance text-muted-foreground">Automate your tasks and workflows by connecting your favorite tools like Notion,
					Todoist, and more. AI-powered scheduling helps you stay on track and adapt to
					changing priorities.</p> <div class="rounded-3xl bg-foreground/5 p-6"><!></div></div> <div class="relative mt-16 grid gap-12 border-b border-foreground/10 pb-12 [--radius:1rem] md:grid-cols-2"><div><h3 class="text-xl font-semibold text-foreground">Marketing Campaigns</h3> <p class="my-4 text-lg text-muted-foreground">Effortlessly plan and execute your marketing campaigns organized.</p> <!></div> <div><h3 class="text-xl font-semibold text-foreground">AI Meeting Scheduler</h3> <p class="my-4 text-lg text-muted-foreground">Effortlessly book and manage your meetings. Stay on top of your schedule.</p> <!></div></div> <blockquote class="relative mt-12 max-w-xl pl-6 before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-full before:bg-primary"><p class="text-lg text-foreground">Wow, auto-generated pages are the kind of thing that you don't even know you
					need until you see it. It's like an AI-native CRM.</p> <footer class="mt-4 flex items-center gap-2"><cite>Méschac Irung</cite> <span aria-hidden="true" class="size-1 rounded-full bg-foreground/15"></span> <span class="text-muted-foreground">Creator</span></footer></blockquote></div></div></section>`);

export default function One($$anchor) {
	var section = root();
	var div = $.child(section);
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var div_3 = $.sibling($.child(div_2), 4);
	var node = $.child(div_3);

	FeatureTable(node, {});
	$.reset(div_3);
	$.reset(div_2);

	var div_4 = $.sibling(div_2, 2);
	var div_5 = $.child(div_4);
	var node_1 = $.sibling($.child(div_5), 4);

	Card(node_1, {
		variant: 'soft',
		class: 'aspect-video overflow-hidden px-6',
		children: ($$anchor, $$slotProps) => {
			Card($$anchor, { class: 'h-full translate-y-6' });
		},
		$$slots: { default: true }
	});

	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var node_2 = $.sibling($.child(div_6), 4);

	Card(node_2, {
		variant: 'soft',
		class: 'aspect-video overflow-hidden',
		children: ($$anchor, $$slotProps) => {
			Card($$anchor, { class: 'h-full translate-6' });
		},
		$$slots: { default: true }
	});

	$.reset(div_6);
	$.reset(div_4);
	$.next(2);
	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}