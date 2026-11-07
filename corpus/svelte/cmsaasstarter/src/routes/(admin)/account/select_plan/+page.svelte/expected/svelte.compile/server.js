import * as $ from 'svelte/internal/server';
import PricingModule from "../../../(marketing)/pricing/pricing_module.svelte";

export default function _page($$renderer) {
	$.head('1k4leo4', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Select a Plan</title>`);
		});
	});

	$$renderer.push(`<div class="text-center content-center min-h-[100vh] pb-12 mt-4 flex items-center place-content-center"><div class="flex flex-col w-full px-6"><div><h1 class="text-2xl font-bold mb-2">Select a Plan</h1> <div class="mb-6">View our <a href="/pricing" target="_blank" class="link">pricing page</a> for details.</div> `);
	PricingModule($$renderer, { callToAction: 'Select Plan' });
	$$renderer.push(`<!----></div></div></div>`);
}