import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import PricingModule from "../../../(marketing)/pricing/pricing_module.svelte";

var root = $.from_html(`<div class="text-center content-center min-h-[100vh] pb-12 mt-4 flex items-center place-content-center"><div class="flex flex-col w-full px-6"><div><h1 class="text-2xl font-bold mb-2">Select a Plan</h1> <div class="mb-6">View our <a href="/pricing" target="_blank" class="link">pricing page</a> for details.</div> <!></div></div></div>`);

export default function _page($$anchor) {
	var div = root();

	$.head('1k4leo4', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Select a Plan';
		});
	});

	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.sibling($.child(div_2), 4);

	PricingModule(node, { callToAction: 'Select Plan' });
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}