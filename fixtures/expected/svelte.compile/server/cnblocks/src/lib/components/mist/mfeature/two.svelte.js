import * as $ from 'svelte/internal/server';
import { Card } from "$lib/components/ui/card";

export default function Two($$renderer) {
	$$renderer.push(`<section><div class="bg-muted/50 py-24"><div class="mx-auto max-w-5xl px-6"><div><h2 class="text-4xl font-semibold text-foreground">Effortless Task Management</h2> <p class="mt-4 mb-12 text-lg text-balance text-muted-foreground">Automate your tasks and workflows by connecting your favorite tools like Notion,
					Todoist, and more. AI-powered scheduling helps you stay on track and adapt to
					changing priorities.</p></div> <div class="mt-8 grid gap-4 sm:grid-cols-2 md:mt-16 md:grid-cols-3"><div class="space-y-4">`);

	Card($$renderer, {
		variant: 'soft',
		class: 'aspect-video overflow-hidden px-6',
		children: ($$renderer) => {
			Card($$renderer, { class: 'h-full translate-y-6' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="sm:max-w-sm"><h3 class="text-xl font-semibold text-foreground">Marketing Campaigns</h3> <p class="my-4 text-lg text-muted-foreground">Effortlessly book and manage your meetings. Stay on top of your
							schedule.</p></div></div> <div class="space-y-4">`);

	Card($$renderer, {
		variant: 'soft',
		class: 'aspect-video overflow-hidden p-6',
		children: ($$renderer) => {
			Card($$renderer, { class: 'h-full' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="sm:max-w-sm"><h3 class="text-xl font-semibold text-foreground">AI Meeting Scheduler</h3> <p class="my-4 text-lg text-muted-foreground">Effortlessly book and manage your meetings. Stay on top of your
							schedule.</p></div></div> <div class="space-y-4">`);

	Card($$renderer, {
		variant: 'soft',
		class: 'aspect-video overflow-hidden',
		children: ($$renderer) => {
			Card($$renderer, { class: 'h-full translate-6' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="sm:max-w-sm"><h3 class="text-xl font-semibold text-foreground">AI Meeting Scheduler</h3> <p class="my-4 text-lg text-muted-foreground">Effortlessly book and manage your meetings. Stay on top of your
							schedule.</p></div></div></div></div></div></section>`);
}