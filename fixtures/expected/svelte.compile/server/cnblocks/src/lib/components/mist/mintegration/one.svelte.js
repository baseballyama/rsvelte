import * as $ from 'svelte/internal/server';
import Gemini from "../mlogos/Gemini.svelte";
import GooglePaLM from "../mlogos/GooglePaLM.svelte";
import Replit from "../mlogos/Replit.svelte";
import MediaWiki from "../mlogos/MediaWiki.svelte";
import MagicUI from "../mlogos/MagicUI.svelte";
import VSCodium from "../mlogos/VSCodium.svelte";

export default function One($$renderer) {
	$$renderer.push(`<section><div class="mx-auto max-w-5xl px-6 py-8"><div class="flex flex-wrap items-center gap-4"><p class="font-medium text-muted-foreground">Integrate with :</p> <div class="flex max-w-2xs flex-wrap gap-3 divide-x *:pr-3"><div>`);
	Gemini($$renderer, { class: 'm-auto size-5' });
	$$renderer.push(`<!----></div> <div>`);
	GooglePaLM($$renderer, { class: 'm-auto size-5' });
	$$renderer.push(`<!----></div> <div>`);
	Replit($$renderer, { class: 'm-auto size-5' });
	$$renderer.push(`<!----></div> <div>`);
	MediaWiki($$renderer, { class: 'm-auto size-5' });
	$$renderer.push(`<!----></div> <div>`);
	MagicUI($$renderer, { class: 'm-auto size-5' });
	$$renderer.push(`<!----></div> <div>`);
	VSCodium($$renderer, { class: 'm-auto size-5' });
	$$renderer.push(`<!----></div></div></div></div></section>`);
}