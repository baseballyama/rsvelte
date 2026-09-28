import * as $ from 'svelte/internal/server';
import { Cisco, Slack, Spotify, Vercel } from "$lib/svgs";

export default function Two($$renderer) {
	$$renderer.push(`<section><div class="mx-auto max-w-5xl px-6 py-8"><div class="flex flex-wrap items-center gap-4"><p class="text-center text-muted-foreground">Trusted by teams at :</p> <div class="flex items-center justify-center gap-8"><div class="flex items-center justify-center">`);
	Vercel($$renderer, { class: 'h-4 w-full text-foreground', variant: 'full' });
	$$renderer.push(`<!----></div> <div class="flex items-center justify-center">`);
	Cisco($$renderer, { class: 'h-3 w-full text-foreground' });
	$$renderer.push(`<!----></div> <div class="flex items-center justify-center">`);
	Slack($$renderer, { class: 'h-3 w-full' });
	$$renderer.push(`<!----></div> <div class="flex items-center justify-center">`);
	Spotify($$renderer, { class: 'h-4 w-full' });
	$$renderer.push(`<!----></div></div></div></div></section>`);
}