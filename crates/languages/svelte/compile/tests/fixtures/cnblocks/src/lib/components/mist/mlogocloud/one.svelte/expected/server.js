import * as $ from 'svelte/internal/server';
import { Cisco, Slack, Spotify, Vercel } from "$lib/svgs";

export default function One($$renderer) {
	$$renderer.push(`<section><div class="mx-auto max-w-5xl px-6 py-8"><div><p class="font-medium text-muted-foreground">Trusted by teams at :</p> <div class="mt-4 flex items-center gap-12"><div class="flex items-center justify-center">`);
	Vercel($$renderer, { class: 'h-5 w-full text-foreground', variant: 'full' });
	$$renderer.push(`<!----></div> <div class="flex items-center justify-center">`);
	Cisco($$renderer, { class: 'h-4 w-full text-foreground' });
	$$renderer.push(`<!----></div> <div class="flex items-center justify-center">`);
	Slack($$renderer, { class: 'h-4 w-full' });
	$$renderer.push(`<!----></div> <div class="flex items-center justify-center">`);
	Spotify($$renderer, { class: 'h-5 w-full' });
	$$renderer.push(`<!----></div></div></div></div></section>`);
}