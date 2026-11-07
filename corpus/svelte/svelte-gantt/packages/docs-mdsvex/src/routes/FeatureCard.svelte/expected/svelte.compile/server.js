import * as $ from 'svelte/internal/server';

export default function FeatureCard($$renderer, $$props) {
	$$renderer.push(`<div class="bg-slate-200/40 p-4"><h2 class="text-lg font-medium text-slate-500"><!--[-->`);
	$.slot($$renderer, $$props, 'title', {}, null);
	$$renderer.push(`<!--]--></h2> <p class="text-slate-400 pt-1"><!--[-->`);
	$.slot($$renderer, $$props, 'subtitle', {}, null);
	$$renderer.push(`<!--]--></p></div>`);
}